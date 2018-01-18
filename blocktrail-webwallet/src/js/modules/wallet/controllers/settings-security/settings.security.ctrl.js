angular.module("blocktrail.wallet")
    .controller("SettingsSecurityCtrl", SettingsSecurityCtrl);

// TODO Review this part, decrease dependencies, create form settings service and move $http request to service
function SettingsSecurityCtrl($scope, $http, $rootScope, $q, cryptoJS, sdkService, launchService, activeWallet,
                            $translate, $timeout, $log, $sce, dialogService, accountSecurityService, $filter,
                            CONFIG, $modal, formSettingsService, passwordStrengthService, settingsService) {
    var settings = settingsService.getReadOnlySettingsData();

    var listenerEnabled2faToggle;
    // Final 2fa true/false
    var isEnabled2fa = false;
    // Toggle for enable in scope
    $scope.isEnabled2fa = false;

    accountSecurityService.updateSecurityScore().then(function () {
        $scope.accountSecurityInfo = accountSecurityService.getSecurityScore();
    });

    $rootScope.pageTitle = 'SETTINGS';

    // this automatically updates an already open modal instead of popping a new one open
    // TODO remove it after moving modals change password, enable/disable 2FA
    $scope.alert = dialogService.alertSingleton();

    $scope.isLoading = true;

    // Methods
    $scope.onChangePassword = onChangePassword;

    formSettingsService.fetchData()
        .then(initData);

    /**
     * Init data
     *
     * @param data
     */
    function initData(data) {
        isEnabled2fa = data.isEnabled2faToggle;
        $scope.isEnabled2fa = isEnabled2fa;

        // Add watchers
        listenerEnabled2faToggle = $scope.$watch('isEnabled2fa', open2faModal);

        $scope.isLoading = false;
    }

    // TODO move to modal controller
    function onChangePassword() {
        launchService.getAccountInfo().then(function(accountInfo) {
            if (activeWallet._sdkWallet.walletVersion === blocktrailSDK.Wallet.WALLET_VERSION_V1) {
                throw new Error("You're using a beta wallet, can't upgrade! Contact the Blocktrail team!");
            }

            return dialogService.prompt({
                title: $translate.instant('CHANGE_PASSWORD'),
                body: $translate.instant('ENTER_CURRENT_PASSWORD'),
                input_type: 'password',
                icon: 'key'
            })
                .result
                .then(function(currentPassword) {
                    $scope.alert($translate.instant('CHANGE_PASSWORD'), $translate.instant('VERIFYING'), false);

                    return $http.post(CONFIG.API_URL + "/v1/BTC/mywallet/check", {
                        login: accountInfo.email || accountInfo.username,
                        password: cryptoJS.SHA512(currentPassword).toString()
                    })
                        .then(
                            function(result) {
                                var requires2FA = !!result.data.requires_2fa;

                                if (accountInfo.requires2FA != requires2FA) {
                                    return launchService.updateAccountInfo({requires2FA: requires2FA})
                                        .then(function(_accountInfo) {
                                            accountInfo = _accountInfo;

                                            $scope.alert.dismiss();
                                            return true;
                                        });
                                } else {
                                    $scope.alert.dismiss();
                                    return true;
                                }
                            },
                            function(error) {
                                if (error) {
                                    throw new Error('MSG_BAD_LOGIN');
                                } else {
                                    throw new Error('MSG_BAD_NETWORK');
                                }
                            }
                        )
                        .then(function() {
                            return currentPassword;
                        })
                })
                .then(function(currentPassword) {
                    var newScore = null;
                    return dialogService.prompt({
                        title: $translate.instant('CHANGE_PASSWORD'),
                        body: $translate.instant('ENTER_NEW_PASSWORD'),
                        input_type: 'password',
                        icon: 'key'
                    })
                        .result
                        .then(function(newPassword) {
                            return passwordStrengthService.checkPassword(newPassword, [settings.email, settings.username, "btc", "wallet"])
                                .then(function(result) {
                                    result.duration = $filter("duration")(result.crack_times_seconds.online_no_throttling_10_per_second * 1000);
                                    return result;
                                })
                                .then(function(result) {
                                    // Allow password change only if password is secure enough, otherwise notify user
                                    if (result.score < CONFIG.REQUIRED_PASSWORD_STRENGTH) {
                                        throw new Error($translate.instant('MSG_WEAK_PASSWORD'));
                                    } else {
                                        newScore = result.score;
                                        return dialogService.prompt({
                                            title: $translate.instant('CHANGE_PASSWORD'),
                                            body: $translate.instant('ENTER_REPEAT_PASSWORD'),
                                            input_type: 'password',
                                            icon: 'key'
                                        }).result
                                    }
                                })
                                .then(function(newPassword2) {
                                    if (newPassword != newPassword2) {
                                        throw new Error($translate.instant('MSG_BAD_PASSWORD_REPEAT'));
                                    }

                                    return newPassword;
                                })
                        })
                        .then(function(newPassword) {
                            return $q.when(null).then(function() {
                                if (accountInfo.requires2FA) {
                                    return dialogService.prompt({
                                        title: $translate.instant('CHANGE_PASSWORD'),
                                        body: $translate.instant('MSG_MISSING_TWO_FACTOR_TOKEN')
                                    }).result;
                                } else {
                                    return null;
                                }
                            }).then(function(twoFactorToken) {
                                $scope.alert(
                                    $translate.instant('CHANGE_PASSWORD'),
                                    $translate.instant('CHANGE_PASSWORD_WALLET_INPROGRESS'),
                                    false
                                );

                                return activeWallet.unlockWithPassword(currentPassword).then(function(wallet) {
                                    return wallet.doPasswordChange(newPassword)
                                        .then(function(r) {
                                            var newEncryptedWalletSecret = r[0];
                                            var newEncrypedWalletSecretMnemonic = r[1];

                                            // don't submit new encrypted secret if we don't have a secret
                                            var encryptedSecret = accountInfo.secret ? cryptoJS.AES.encrypt(accountInfo.secret, newPassword).toString() : null;

                                            var passwordChange = function() {
                                                return sdkService.getSdkByActiveNetwork().passwordChange(
                                                    cryptoJS.SHA512(currentPassword).toString(),
                                                    cryptoJS.SHA512(newPassword).toString(),
                                                    encryptedSecret,
                                                    twoFactorToken,
                                                    [{
                                                        identifier: wallet.identifier,
                                                        encrypted_secret: newEncryptedWalletSecret
                                                    }]
                                                )
                                                    .then(
                                                        function() {
                                                            wallet.encryptedSecret = newEncryptedWalletSecret;
                                                            wallet.lock();

                                                            return $scope.alert({
                                                                title: $translate.instant('CHANGE_PASSWORD'),
                                                                bodyHtml: $sce.trustAsHtml($translate.instant('CHANGE_PASSWORD_BACKUP')),
                                                                ok: $translate.instant('BACKUP_CREATE_PDF')
                                                            }).result.then(function() {
                                                                launchService.storeBackupInfo({
                                                                    encryptedSecret: newEncryptedWalletSecret
                                                                });

                                                                settingsService.updateSettingsUp({ 'passwordScore': newScore })
                                                                    .then(accountSecurityService.updateSecurityScore);

                                                                var backup = new blocktrailSDK.BackupGenerator(
                                                                    wallet.identifier,
                                                                    {
                                                                        encryptedSecret: newEncrypedWalletSecretMnemonic
                                                                    },
                                                                    {},
                                                                    {
                                                                        page1: false,
                                                                        page2: true,
                                                                        page3: false
                                                                    }
                                                                );

                                                                try {
                                                                    backup.generatePDF(function(err, pdf) {
                                                                        if (err) {
                                                                            $log.error(err);
                                                                            $scope.alert({
                                                                                title: $translate.instant('ERROR'),
                                                                                body: "" + err
                                                                            });
                                                                        } else {
                                                                            pdf.save("BlockTrail Updated Recovery Data Sheet - " + wallet.identifier + ".pdf");

                                                                            // delete all temp backup info
                                                                            launchService.clearBackupInfo();
                                                                        }
                                                                    });
                                                                } catch (error) {
                                                                    $log.error("Backup generation error", error);
                                                                }
                                                            });
                                                        },
                                                        function(error) {
                                                            wallet.lock();

                                                            if (error instanceof blocktrailSDK.WalletInvalid2FAError) {
                                                                return dialogService.prompt({
                                                                    title: $translate.instant('CHANGE_PASSWORD'),
                                                                    body: $translate.instant('MSG_INCORRECT_TWO_FACTOR_TOKEN')
                                                                })
                                                                    .result
                                                                    .then(function(_twoFactorToken) {
                                                                        twoFactorToken = _twoFactorToken;
                                                                        return passwordChange();
                                                                    })
                                                                    ;
                                                            } else if (error) {
                                                                throw new Error('MSG_BAD_LOGIN');
                                                            } else {
                                                                throw new Error('MSG_BAD_NETWORK');
                                                            }
                                                        }
                                                    );

                                            };

                                            return passwordChange();
                                        });
                                });
                            });
                        });
                })
        })
            .catch(function(err) {
                if (err && err.message) {
                    $scope.alert($translate.instant('CHANGE_PASSWORD'), err.message);
                }
            })
    }

    /**
     * Open two factor authentication modal
     */
    function open2faModal(newVal, oldVal) {
        if((newVal != oldVal) && (newVal != isEnabled2fa)) {
            if (newVal) {
                enable2FA();
            } else {
                disable2FA();
            }
        }
    }

    // TODO move to modal controller
    function enable2FA() {
        var pleaseWaitDialog;

        return $q.when(null)
            .then(function() {
                // Enter password
                return dialogService.prompt({
                    title: $translate.instant('SETTINGS_2FA'),
                    subtitle: $translate.instant('SETTINGS_2FA_STEP1'),
                    body: $translate.instant('SETTINGS_2FA_STEP1_BODY'),
                    label: $translate.instant('SETTINGS_2FA_PASSWORD'),
                    input_type: 'password',
                    ok: $translate.instant('CONTINUE'),
                })
                    .result
                    .then(function(password) {
                        pleaseWaitDialog = dialogService.alert({
                            title: $translate.instant('SETTINGS_2FA'),
                            body: $translate.instant('PLEASE_WAIT'),
                            body_class: 'text-center',
                            showSpinner: true,
                            ok: false
                        });

                        return formSettingsService.sdkSetup2FA(password)
                            .then(function(result) {
                                pleaseWaitDialog.dismiss();

                                // QR code
                                return dialogService.alert({
                                    title: $translate.instant('SETTINGS_2FA'),
                                    subtitle: $translate.instant('SETTINGS_2FA_STEP2'),
                                    bodyHtml: $sce.trustAsHtml($translate.instant('SETTINGS_2FA_STEP2_BODY')),
                                    bodyExtra: $translate.instant('SETINGS_2FA_STEP2_CODE', { secret: result.secret }),
                                    ok: $translate.instant('CONTINUE'),
                                    cancel: $translate.instant('CANCEL'),
                                    qr: {
                                        correctionLevel: 7,
                                        SIZE: 225,
                                        inputMode: 'M',
                                        image: true,
                                        text: result.otp_uri
                                    }
                                })
                                    .result
                                    .then(function() {
                                        return dialogService.prompt({
                                            title: $translate.instant('SETTINGS_2FA'),
                                            subtitle: $translate.instant('SETTINGS_2FA_STEP3'),
                                            body: $translate.instant('SETTINGS_2FA_STEP3_BODY'),
                                            label: $translate.instant('TWO_FACTOR_TOKEN'),
                                            ok: $translate.instant('SETTINGS_2FA_VERIFY_TOKEN')
                                        })
                                            .result
                                            .then(function(twoFactorToken) {
                                                pleaseWaitDialog = dialogService.alert({
                                                    title: $translate.instant('SETTINGS_2FA'),
                                                    body: $translate.instant('PLEASE_WAIT'),
                                                    body_class: 'text-center',
                                                    showSpinner: true,
                                                    ok: false
                                                });

                                                return formSettingsService.sdkEnable2FA(twoFactorToken)
                                                    .then(function() {
                                                        pleaseWaitDialog.update({
                                                            title: $translate.instant('SETTINGS_2FA'),
                                                            body: $translate.instant('SETTINGS_2FA_DONE'),
                                                            body_class: 'text-center',
                                                            ok: false
                                                        });

                                                        return formSettingsService.updateLaunchService2FA($scope.isEnabled2fa)
                                                            .then(function () {
                                                                isEnabled2fa = $scope.isEnabled2fa;

                                                                launchService.updateAccountInfo({
                                                                    requires2FA: true
                                                                }).then(function () {

                                                                    accountSecurityService.updateSecurityScore();
                                                                    pleaseWaitDialog.dismiss();

                                                                });
                                                            });

                                                    }, function (e) {
                                                        // Error handler for wrong two factor token
                                                        $scope.isEnabled2fa = isEnabled2fa;

                                                        if (pleaseWaitDialog) {
                                                            pleaseWaitDialog.dismiss();
                                                        }

                                                        dialogService.alert({
                                                            title: $translate.instant('SETTINGS_2FA'),
                                                            body: e.message || e
                                                        });
                                                    });

                                            });
                                    }, function () {
                                        // Reset for enter QR code
                                        $scope.isEnabled2fa = isEnabled2fa;
                                    }).catch(function () {
                                        $scope.isEnabled2fa = isEnabled2fa;
                                    });
                            }, function (e) {
                                // Error handler for wrong password
                                $scope.isEnabled2fa = isEnabled2fa;

                                if (pleaseWaitDialog) {
                                    pleaseWaitDialog.dismiss();
                                }

                                dialogService.alert({
                                    title: $translate.instant('SETTINGS_2FA'),
                                    body: e.message || e
                                });
                            });


                    }, function () {
                        // Reset for enter password
                        $scope.isEnabled2fa = isEnabled2fa;
                    });
            });
    }

    // TODO move to modal controller
    function disable2FA() {
        var pleaseWaitDialog;

        return $q.when(null)
            .then(function() {
                return dialogService.prompt({
                    title: $translate.instant('SETTINGS_2FA'),
                    subtitle: $translate.instant('SETTINGS_2FA_DISABLE_2FA'),
                    body: $translate.instant('SETTINGS_2FA_DISABLE_BODY'),
                    label: $translate.instant('TWO_FACTOR_TOKEN'),
                    ok: $translate.instant('SETTINGS_2FA_DISABLE_2FA')
                })
                    .result
                    .then(function(twoFactorToken) {
                        pleaseWaitDialog = dialogService.alert({
                            title: $translate.instant('SETTINGS_2FA'),
                            body: $translate.instant('PLEASE_WAIT'),
                            body_class: 'text-center',
                            showSpinner: true,
                            ok: false
                        });

                        return formSettingsService.sdkDisable2FA(twoFactorToken)
                            .then(function() {
                                pleaseWaitDialog.update({
                                    title: $translate.instant('SETTINGS_2FA'),
                                    body: $translate.instant('SETTINGS_2FA_DISABLE_DONE'),
                                    body_class: 'text-center',
                                    ok: false
                                });

                                return formSettingsService.updateLaunchService2FA($scope.isEnabled2fa)
                                    .then(function () {
                                        isEnabled2fa = $scope.isEnabled2fa;

                                        launchService.updateAccountInfo({
                                            requires2FA: false
                                        }).then(function () {
                                            accountSecurityService.updateSecurityScore();
                                            $timeout(function() {
                                                pleaseWaitDialog.dismiss();
                                            }, 1500);
                                        });
                                    });
                            }, function (e) {
                                // Error handler for wrong two factor token
                                $scope.isEnabled2fa = isEnabled2fa;

                                if (pleaseWaitDialog) {
                                    pleaseWaitDialog.dismiss();
                                }

                                dialogService.alert({
                                    title: $translate.instant('SETTINGS_2FA'),
                                    body: e.message || e
                                });
                            });
                    }, function() {
                        // Reset for enter two factor token
                        $scope.isEnabled2fa = isEnabled2fa;
                    });
            });
    }

    $scope.verifyEmail = function () {
        var sdk = activeWallet.getSdkWallet().sdk;

        if (!settings.verifiedEmail) {
            return sdk.requestVerificationEmail()
                .then(function (result) {
                    // err handling
                    if (!result) {
                        return dialogService.alert(
                            $translate.instant('ERROR_TITLE_2'),
                            $translate.instant('MSG_ERROR_SENDING_MAIL')
                        ).result;
                    }

                    return dialogService.alert(
                        $translate.instant('CHECK_YOUR_INBOX'),
                        $translate.instant('MSG_EMAIL_VERIFY')
                    ).result
                })
                .catch(function (e) {
                    return dialogService.alert(
                        $translate.instant('ERROR_TITLE_2'),
                        $translate.instant('MSG_ERROR_SENDING_MAIL')
                    ).result;
                });
        } else {
            return dialogService.alert(
                $translate.instant('SETTINGS_INFO'),
                $translate.instant('EMAIL_VERIFIED')
            ).result
        }
    };

    $scope.$on('$destroy', function() {
        if(listenerEnabled2faToggle) {
            listenerEnabled2faToggle()
        }
    });
}