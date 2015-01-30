define(["knockout"],
    function(ko) {
        'use strict';

        function KnockoutUtilities (){}

        //TODO: Ne pas utiliser cette méthode - trop lourde...
        //mieux connaitre/identifier les observables des viewmodels
        KnockoutUtilities.prototype.toJS = function(obj) {
            //if (utilities.isNullOrUndefined(obj))
            //    return obj;

            //var mapping = {
            //    'ignore': ["__ko_mapping__"]
            //};

            //var result = ko.toJS(obj, mapping);

            var result = ko.toJS(obj);

            utilities.removeKoMappingProperties(result);

            return result;

            ////var newObg = utilities.deepCopy(obj);

            //if (ko.isObservable(obj)) {
            //    obj = ko.utils.unwrapObservable(obj);
            //}

            //var newObg = null;

            //if (obj) {
            //    if (obj.hasOwnProperty('__ko_mapping__')) {
            //        newObg = ko.mapping.toJS(obj, { include: ['$type'] });
            //    } else {
            //        newObg = ko.toJS(obj);
            //    }

            //    for (var property in newObg) {
            //        if (newObg.hasOwnProperty(property)) {
            //            var type = typeof newObg[property];

            //            if (type  === 'object' || type === 'function')
            //            {
            //                newObg[property] = utilities.toJS(newObg[property]);
            //            }
            //        }
            //    }
            //}

            //return newObg;
        };

        KnockoutUtilities.prototype.removeKoMappingProperties = function(obj) {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (property == '__ko_mapping__') {
                        delete obj[property];
                    } else {
                        var type = typeof obj[property];

                        if (type === 'object' || type === 'function') {
                            utilities.removeKoMappingProperties(obj[property]);
                        }
                    }
                }
            }
        };

        //todo: remove when this https://github.com/knockout/knockout/issues/1475
        KnockoutUtilities.prototype.koBindingDone = function(element, childElementCount, attempts) {
            var dfd = $.Deferred();

            if (!attempts) {
                attempts = 400; //default
            }

            koBindingDoneTest(1, element, dfd, childElementCount, attempts);

            return dfd.promise();
        };

        KnockoutUtilities.prototype.registerComponent = function(name, componentConfig) {
            componentConfig = componentConfig || {};

            if (!name) {
                throw new Error('Framework.registerComponent - Argument missing exception: name');
            }

            if (ko.components.isRegistered(name)) {
                throw new Error('Framework.registerComponent - Already registered component: ' + name);
            }

            var basePath = componentConfig.basePath || 'components/';

            if (componentConfig.isBower) {
                if (!componentConfig.type) {
                    componentConfig.type = "component";
                }

                basePath = "bower_components/rc." + componentConfig.type + "." + name + "/dist/components/";
            }

            var requirePath = basePath + name + '/' + name;

            if (componentConfig.htmlOnly) {
                requirePath = 'text!' + requirePath + '.html';
            }

            var koComponentConfig = {
                require: requirePath
            };

            if (componentConfig.htmlOnly) {
                koComponentConfig = {
                    template: koComponentConfig
                };
            }

            ko.components.register(name, koComponentConfig);
        };

        function koBindingDoneTest(attempt, element, dfd, childElementCount, attempts) {
            if (attempt >= attempts) {
                dfd.reject('koBindingDone timeout after ' + attempts + ' attempts.');
                return;
            }

            // console.info('attempt', attempt, element.childElementCount);
            var bindingDone = element.childElementCount > 0;

            if (childElementCount) {
                bindingDone = element.childElementCount === childElementCount;
            }

            if (bindingDone) {
                dfd.resolve(element);
                return;
            }

            setTimeout(function() {
                koBindingDoneTest(attempt + 1, element, dfd, childElementCount, attempts);
            }, 1);
        }

        return new  KnockoutUtilities();
    });
