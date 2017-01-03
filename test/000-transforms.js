'use strict';

const Joi = require('../');
const _ = require('lodash');
const assert = require('assert');

function log() {
    const args = _.toArray(arguments);
    if (args.length === 1) {
        console.log(JSON.stringify(args[0], null, 4));
    } else {
        console.log(JSON.stringify(args, null, 4));
    }
}

describe('tests', function() {

    it('should validate and transform', function(done) {

        let input = {
            'first_name': 'John',
            'last_name': 'Doe',
            'age': 30
        };

        return Joi.transform(input, {
            'first_name': Joi.string().required().label('First Name'),
            'last_name': Joi.string().required().label('Last Name'),
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

    it('should validate / transform and ignore unknown keys', function(done) {

        let input = {
            'first_name': 'John',
            'last_name': 'Doe',
            'age': 30,
            'foo': 'bar'
        };

        return Joi.transform(input, {
            'first_name': Joi.string().required().label('First Name'),
            'last_name': Joi.string().required().label('Last Name'),
            'age': Joi.number().integer().positive().required().label('Age')
        }, {
            'stripUnknown': true
        }, {
            'name': function(data, something) {
                return `Something: ${something}`;
            },
            'something': function(data) {
                return data.age;
            }
        })
            .spread((data, transforms) => {

                assert(_.isEqual(data, _.pick(input, 'first_name', 'last_name', 'age')));
                assert(_.isEqual(transforms, {
                    'name': 'Something: 30',
                    'something': 30
                }));

            })
            .then(done)
            .catch(done);

    });

    it('should fill in a default value', function(done) {

        let input = {
            'note': `Here is a note.`
        };

        return Joi.transform(input, {
            'note': Joi.string().required().label('Note'),
            'is_private': Joi.boolean().default(false).label('Is Private')
        })
            .spread((data) => {

                assert(_.isEqual(data, {
                    'note': `Here is a note.`,
                    'is_private': false
                }));

            })
            .then(done)
            .catch(done);

    });

    it('should conditionally validate', function(done) {

        let input = {
            'admin': true,
            'admin_id': 1
        };

        return Joi.transform(input, {
            'admin': Joi.boolean().default(false).label('Admin'),
            'admin_id': Joi.number().integer().positive().label('Admin ID').required()
                .when('admin', {
                    'is': true,
                    'otherwise': Joi.forbidden()
                })
        })
            .spread((data) => {

                log(data);

            })
            .then(done)
            .catch(done);

    });

    it('should conditionally validate', function(done) {

        let input = {
            'admin': false,
            'user_id': 1
        };

        return Joi.transform(input, {
            'admin': Joi.boolean().default(false).label('Admin'),
            'user_id': Joi.number().integer().positive().label('User ID').required()
                .when('admin', {
                    'is': false,
                    'otherwise': Joi.forbidden()
                })
        })
            .spread((data) => {

                log(data);

            })
            .then(done)
            .catch(done);

    });

    it('should validate schema object (rename)', function(done) {

        let input = {
            'admin': false,
            'user_id': 1
        };

        let schema = Joi.object().keys({
            'admin': Joi.boolean().required().label('Admin'),
            'foo_id': Joi.number().integer().positive().label('User ID')
        })
            .rename('user_id', 'foo_id');

        return Joi.transform(input, schema)
            .spread((data) => {

                log(data);

            })
            .then(done)
            .catch(done);

    });

    it('should validate schema object (branching)', function(done) {

        // let input = {
        //     'admin': true,
        //     'admin_id': 1
        // };

        let input = {
            'admin': false,
            'user_id': 1
        };

        let schema = Joi.alternatives().try([
            Joi.object().keys({
                'admin': Joi.boolean().required().valid(true).label('Admin'),
                'admin_id': Joi.number().integer().positive().required().label('Admin ID')
            }),
            Joi.object().keys({
                'admin': Joi.boolean().required().valid(false).label('Admin'),
                'user_id': Joi.number().integer().positive().required().label('Admin ID')
            })
        ]);

        return Joi.transform(input, schema)
            .spread((data) => {

                log(data);

            })
            .then(done)
            .catch(done);

    });

});
