# joi-transform

This module provides a simple, consolidated, promise-based API that extends the [Joi](https://github.com/hapijs/joi) object schema validator with functionality for performing transformations (synchronous / asynchronous) on successfully-validated data.

Lead Maintainer: [Tim Ambler](https://github.com/tkambler)

## Example

In the following example, three arguments are passed to the `transform()` method, the first two of which should be familiar to those with previous experience using Joi:

- A payload of data to be validated and transformed
- A Joi schema object
- A transformation object

The third argument - the transformation object - is used to define one or more transformations to be run once Joi's validation process has finished. Each transformation can run synchronously or asynchronously (by returning a promise).

Transformation functions always receive as their first argument the result of Joi's validation process. They may also specify additional parameters to reference other entries within the transformation object.

```
var Joi = require('joi-transform');

Joi.transform({
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
```

## Related Resources

- [Joi](https://github.com/hapijs/joi)
