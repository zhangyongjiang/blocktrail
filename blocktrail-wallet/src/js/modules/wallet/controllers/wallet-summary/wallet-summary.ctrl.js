(function() {
    "use strict";

    angular.module("blocktrail.wallet")
        .controller("WalletSummaryCtrl", WalletSummaryCtrl);

    function WalletSummaryCtrl($rootScope, $scope, $q, activeWallet, settingsService, localSettingsService,
                               buyBTCService, CurrencyConverter, modalService) {
        var transactionsListLimitStep = 7;
        var lastDateHeader = 0; // used to keep track of the last date header added
        var isIgnoreInfiniteScroll = false;

        $scope.walletData = activeWallet.getReadOnlyWalletData();
        $scope.settingsData = settingsService.getReadOnlySettingsData();
        $scope.localSettingsData = localSettingsService.getReadOnlyLocalSettingsData();

        $scope.isLoading = true;
        $scope.isForceForcePolling = false;
        $scope.isShowNoMoreTransactions = false;
        $scope.showBCCSweepWarning = false;
        $scope.lastDateHeader = lastDateHeader;
        $scope.buyBtcPendingOrders = []; // Glidera transactions
        $scope.transactionsListLimit = transactionsListLimitStep;

        $scope.isHeader = isHeader;
        $scope.getTransactionHeader = getTransactionHeader;
        $scope.onShowTransaction = onShowTransaction;
        $scope.onShowMoreTransactions = onShowMoreTransactions;
        $scope.onRefreshTransactions = onRefreshTransactions;

        $scope.onScroll = angular.noop;

        initData();

        if ($scope.walletData.networkType === "BCC") {
            activeWallet.isReady.then(function() {
                $scope.showBCCSweepWarning = !$scope.walletData.transactions.length && !$scope.settingsData.hideBCCSweepWarning;
            });
        }

        /**
         * Init data
         */
        function initData() {
            $scope.isLoading = true;

            return $q.all([
                $q.when($rootScope.getPrice()),
                $q.when(getGlideraTransactions())
            ]).then(function() {
                $scope.isLoading = false;
            }, function (err) {
                $scope.isLoading = false;
                console.log('err', err);
            });
        }

        function onRefreshTransactions() {
            if(!$scope.isForceForcePolling) {
                $scope.isForceForcePolling = true;

                activeWallet.forcePolling()
                    .then(function() {
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.isForceForcePolling = false;
                        isIgnoreInfiniteScroll = true;
                    })
                    .catch(function() {
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.isForceForcePolling = false;
                    });
            }
        }

        /**
         * Get glidera transactions
         *
         * TODO move this logic to Wallet class
         */
        function getGlideraTransactions() {
            $scope.buyBtcPendingOrders = [];

            $scope.settingsData.glideraTransactions.forEach(function(glideraTxInfo) {
                // don't display completed TXs, they will be part of our normal transaction history
                if (glideraTxInfo.transactionHash || glideraTxInfo.status === "COMPLETE") {
                    return;
                }

                // only display TXs that are related to this wallet
                if (glideraTxInfo.walletIdentifier !== $scope.walletData.identifier) {
                    return;
                }

                var order = {
                    transactionUuid: glideraTxInfo.transactionUuid,
                    qty: CurrencyConverter.toSatoshi(glideraTxInfo.qty, 'BTC'),
                    qtyBTC: glideraTxInfo.qty,
                    currency: glideraTxInfo.currency,
                    price: glideraTxInfo.price,
                    total: (glideraTxInfo.price * glideraTxInfo.qty).toFixed(2),
                    time: glideraTxInfo.time,
                    avatarUrl: buyBTCService.BROKERS.glidera.avatarUrl,
                    displayName: buyBTCService.BROKERS.glidera.displayName
                };

                $scope.buyBtcPendingOrders.push(order);
            });

            // latest first
            $scope.buyBtcPendingOrders.reverse();
        }


        /**
         * On show more transactions
         *
         * Handler for "infinite-scroll" directive
         */
        function onShowMoreTransactions() {
            if(isIgnoreInfiniteScroll) {
                isIgnoreInfiniteScroll = false;
            } else {
                if($scope.transactionsListLimit < $scope.walletData.transactions.length) {
                    $scope.transactionsListLimit = $scope.transactionsListLimit + transactionsListLimitStep;
                } else if ($scope.walletData.transactions.length && $scope.transactionsListLimit >= $scope.walletData.transactions.length) {
                    $scope.isShowNoMoreTransactions = true;
                }
            }

            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        /**
         * Is header
         *
         * @param transaction
         * @return {boolean}
         */
        function isHeader(transaction) {
            var isHeader = false;
            var date = new Date(transaction.time * 1000);

            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            if (lastDateHeader !== date.valueOf()) {
                lastDateHeader = date.valueOf();
                isHeader = true;
            }

            return isHeader;
        }

        /**
         * Get transaction header
         *
         * @return {number}
         */
        function getTransactionHeader() {
            return lastDateHeader;
        }

        /**
         * On show transaction
         *
         * @param transaction
         */
        function onShowTransaction(transaction) {
            modalService.show("js/modules/wallet/controllers/modal-wallet-transaction-info/modal-wallet-transaction-info.tpl.html", "ModalWalletTransactionInfo", {
                transaction: transaction,
                walletData: $scope.walletData,
                localCurrency: $scope.settingsData.localCurrency
            });
        }
    }
})();
