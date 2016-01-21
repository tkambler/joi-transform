'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var Joi = Promise.promisifyAll(require('joi'));
var DepGraph = require('dependency-graph').DepGraph;
var getParamNames = require('./lib/get-param-names');

var transform = function(input, schema, transforms) {

    input = input || {};
    schema = schema || {};
    transforms = transforms || {};

    return Joi.validateAsync(input, schema)
        .then((validatedInput) => {

            var graph = new DepGraph();

            return Promise.resolve()
                .then(() => {

                    _.each(transforms, (fn, transformProp) => {
                        graph.addNode(transformProp);
                    });

                    var transformParams = {};

                    _.each(transforms, (fn, transformProp) => {
                        transformParams[transformProp] = getParamNames(fn)
                        transformParams[transformProp] = _.without(transformParams[transformProp], 'data');
                        transformParams[transformProp].forEach((param) => {
                            graph.addDependency(transformProp, param);
                        });
                    });

                    var order = graph.overallOrder();

                    var transformResolutions = {};

                    return Promise.resolve(order)
                        .each((transformProp, orderPos) => {
                            var params = transformParams[transformProp];
                            var transformArgs = [validatedInput];
                            params.forEach((param) => {
                                transformArgs.push(transformResolutions[param]);
                            });
                            return Promise.resolve(transforms[transformProp].apply(null, transformArgs))
                                .then((transformResult) => {
                                    transformResolutions[transformProp] = transformResult;
                                });
                        })
                        .then(() => {
                            return [validatedInput, transformResolutions];
                        });

                });

        });

};

Joi.transform = transform;

module.exports = Joi;
