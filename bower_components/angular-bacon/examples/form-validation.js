angular.
    module('example', ['angular-bacon']).
    controller('form', function($scope) {
        $scope.username = ''

        var longerThan = function(num) {
            return function(it) {
                return it && it.length > num;
            }
        }
        var longerThanOrEqual = function(num) {
            return function(it) {
                return it && it.length >= num;
            }
        }
        var shorterThan = function (num) {
            return function (it) {
                return typeof it === "string" && it.length < num;
            }
        }
        var identity = function(it) {
            return it;
        }
        var passwordInput = $scope
                .$watchAsProperty('password')

        var passwordsEqual = passwordInput
                .combine(
                    $scope.$watchAsProperty('passwordConfirm'),
                    function(pass, confirm) {
                        return {
                            password: pass,
                            confirm: confirm
                        }
                    }
                )
                .map(function(it) {
                    return it.password === it.confirm
                })
                .toProperty()

        var usernameInput = $scope
                .$watchAsProperty('username')

        var passwordIsValid = passwordInput
                .map(longerThanOrEqual(5))

        var usernameIsFree = usernameInput
                .changes()
                .filter(longerThan(2))
                .flatMapLatest(function(it) { return Bacon.later(2000, it === "user"); })
                .merge(usernameInput.map(false).changes())
                .toProperty(false)

        usernameIsFree
            .and(passwordIsValid)
            .and(passwordsEqual)
            .digest($scope, 'formValid')

        usernameIsFree
            .changes()
            .filter(identity)
            .map(Bacon.constant("free"))
            .merge(usernameIsFree.changes().not().filter(identity).map(Bacon.constant("taken")))
            .merge(usernameInput.map(Bacon.constant("loading")).changes())
            .merge(
                usernameInput
                    .filter(shorterThan(2))
                    .map(Bacon.constant("empty"))
                    .changes()
                )
            .digest($scope, 'usernameState')

        passwordIsValid
            .changes()
            .not()
            .digest($scope, 'passwordInvalid')

        passwordsEqual
            .changes()
            .not()
            .digest($scope, 'passwordsDontMatch')

    })
