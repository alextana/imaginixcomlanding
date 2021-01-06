

(function(){
	var app = angular
		.module("app", ["ui.router"])
		.config(["$stateProvider", "$controllerProvider", function ($stateProvider, $controllerProvider) {
		    app.controllerProvider = $controllerProvider;
		    var path = "/dev";
		    ["index", "earlyaccess", "register", "login", "heroes", "esports",
                "user/index", "user/search",
                "careers", "about", "privacy", "terms", "api", "press"
		    ]
                .map(function add(state) {
                    $stateProvider.state(state, { url: "/" + state, templateUrl: path + "/views/" + state + ".html" })
                });

		    $stateProvider.state("user/visit", { url: "/user/visit/:id", templateUrl: path + "/views/user/visit.html" })
		    $stateProvider.state("/", { url: "/", templateUrl: path + "/views/index.html" })
		    
		}])
        .service("$vrum", [function () {
            var v = new vClient();
            window.$vrum = v; // tmp shortcut
            v.init("ws://ec2-54-172-7-5.compute-1.amazonaws.com:3128");            
            return v;
        }])
        .service("$msg", ["$rootScope", function ($rootScope) {
            var msgBoxElement = $("#msgBox");
            return {
                show: function (title, body, commands) {
                    if (!$rootScope.modal) $rootScope.modal = {};
                    $rootScope.modal.title = title;
                    $rootScope.modal.body = body;
                    $rootScope.modal.commands = commands;

                    if ($rootScope.$$phase != '$apply' && $rootScope.$$phase != '$digest')
                        $rootScope.$apply();

                    setTimeout(function () { msgBoxElement.modal('show'); }, 1); // wait for apply

                }
            };
        }])
		.controller("main", ["$scope", "$vrum", "$state", function ($scope, $vrum, $state) {

		    $scope.$state = $state;
		    $scope.$vrum = $vrum;
		    $vrum.on("profile-update", function (args) { console.log("profile-update"); $scope.$apply(); });
		    $vrum.on("instance-update", function (args) { console.log("instance-update"); $scope.$apply(); });
		    $vrum.on("reset", function () { $scope.$apply(); });

		    // shorthand
		    $scope.$alert 	= function(err, reply) { if (err || reply) return alert(JSON.stringify(reply||("err:"+err))); }
		    $scope.scroll = function (containerId, targetId) { $u.scrollTo(containerId, targetId); }
		    //$scope.$warn 	= function(err, reply) { if (err ) return alert(JSON.stringify(err)); }

		    if (!$state.current || !$state.current.name)
		        $state.go("index");
		    
		    $scope.signout = function () {
		        $vrum.x("profile.auth.signout", {}, function (err, reply) {
		            $vrum.reset();
		            $state.go("index");
		        });
		    }

		}])
	;
})()