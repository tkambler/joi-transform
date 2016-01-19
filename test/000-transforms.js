'use strict';

var Joi = require('joi');
var transform = require('../');
var assert = require('assert');

describe('transforms', function() {

    it('should herp', function() {

        transform({
            'first_name': 'John',
            'last_name': 'Doe',
            'age': 30
        }, {
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

                console.log('data', data);
                console.log('transforms', transforms);

            });

    });

});
