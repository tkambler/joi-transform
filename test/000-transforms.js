'use strict';

const Joi = require('../');
const _ = require('lodash');
const assert = require('assert');

describe('tests', function() {

    it('should validate and transform', function(done) {
        
        let input = {
            'first_name': 'John',
            'last_name': 'Doe',
            'age': 30
        };

        return Joi.transform(input, {
            'first_name': Joi.string().required(),
            'last_name': Joi.string().required(),
            'age': Joi.number().integer().positive().required().label('Age')
        }, {
            'name': function(data, something) {
                return `Something: ${something}`;
            },
            'something': function(data) {
                return data.age;
            }
        })
            .spread((data, transforms) => {
                
                assert(_.isEqual(data, input));
                assert(_.isEqual(transforms, {
                    'name': 'Something: 30',
                    'something': 30
                }));

            })
            .then(done)
            .catch(done);

    });

});
