(function() {
    "use strict";

    angular.module("blocktrail.core")
        .controller("ModalActionButtonsCtrl", ModalActionButtonsCtrl);

    function ModalActionButtonsCtrl($scope, $controller, parameters) {
        // Extend from base controller
        $controller('ModalBaseCtrl', { $scope: $scope });

        $scope.options = parameters.options;
        $scope.buttonCancel = parameters.buttonCancel;

        // Methods
        $scope.select = select;

        /**
         * Select
         * @param value
         */
        function select(value) {
            $scope.closeModal(value);
        }
    }

})();
