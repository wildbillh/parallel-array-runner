/**
 * Created by HODGESW on 10/17/2016.
 */


"use strict";
let assert = require('chai').assert;
let expect = require('chai').expect;
let ParallelArrayRunner = require('../lib/parallel-array-runner');

// Create some simulated async calls that return promises

// This function takes 2 numbers as parameters and returns a promise of their sums.
let addTwoNumbers = (first, second) => {
    return new Promise( (resolve, reject ) => {
        setTimeout( (adder1, adder2) => {
            return resolve(adder1 + adder2);
        },10, first, second);
    });
};


// This function takes 3 parameters and returns a promise of a 3 element array.
let makeArrayFromParms = (first, second, third) => {
    return new Promise( (resolve, reject ) => {
        setTimeout( (p1, p2, p3) => {
            return resolve([].concat(p1, p2, p3));
        },10, first, second, third);
    });
};

// If element is a zero rejects, otherwise passes the element
let rejectIfZeroIsPassed = (element) => {
    return new Promise( (resolve, reject ) => {
        setTimeout( (el) => {
            if (el === 0) {
                return reject('Found a zero element');
            }
            else {
                return resolve(el);
            }
        },10, element);
    });
};

// Simple test to see if 2 arrays contain the exact number and values of elements
let areArraysEqual = (first, second) => {
    if (first.length !== second.length) { return false; }
    for (let i=0; i<first.length; i++) {
        if (first[i] !== second[i]) {return false;}
    }
    return true;
};

// Same as addTwoNumbers above, but implemented as a class method
class AddTwoNumbersClass {
    run (first, second) {
        return new Promise((resolve, reject) => {
            setTimeout((adder1, adder2) => {
                return resolve(adder1 + adder2);
            }, 10, first, second);
        });
    }
}

// -------------------------------------------------------------------------------------------------------

describe('ParallelArrayRunner Tests', function () {
    // Test the constructor
    describe('Class Constructor Tests', function () {

        it("constructor throws an exception if an invalid behavior type is passed", function(done) {
            assert.throw(function () {
                new ParallelArrayRunner('blah');
            }, "");
            done();
        });

        it("constructor with no arguments defaults to ParallelArrayRunner.LAST_RETURN", function(done) {
            let s = new ParallelArrayRunner();
            assert.equal(s.behaviorType, ParallelArrayRunner.LAST_RETURN);
            done();
        });

        it("constructor passed a valid argument, properly sets the type", function (done) {
            let s = new ParallelArrayRunner(ParallelArrayRunner.ARRAY_RETURN);
            assert.equal(s.behaviorType, ParallelArrayRunner.ARRAY_RETURN);
            done();
        });

    });

    describe('Run Method Resolved Data Tests', function () {

        it("Run with ParallelArrayRunner.LAST_RETURN should return last calculated value", function () {
            let s = new ParallelArrayRunner();
            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run([1,2,3,4], addTwoNumbers, null, 10)
                .then ( (sum) => {
                    assert.isNotArray(sum, 'return value should not be an array');
                    assert.equal(sum, 14, 'the last value returned should be 14');
                });
        });

        it("Run with ParallelArrayRunner.ARRAY_RETURN should return array of calculated values", function () {
            let s = new ParallelArrayRunner(ParallelArrayRunner.ARRAY_RETURN);
            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run([1,2,3,4], addTwoNumbers, null, 10)
                .then ( (sumArray) => {
                    assert.lengthOf(sumArray, 4, 'array has length of 4');
                    assert.sameMembers(sumArray, [11,12,13,14],'array should have [11,12,13,14] as members');
                    assert.equal(sumArray[3], 14, 'the last element returned should be 14');
                });
        });

        it("Run with ParallelArrayRunner.CONCAT_ARRAY_RETURN should return concatenated array of calculated values", function () {
            let s = new ParallelArrayRunner(ParallelArrayRunner.CONCAT_ARRAY_RETURN);
            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run([1,2], makeArrayFromParms, null, 10, 20)
                .then ( (sumArray) => {
                    assert.lengthOf(sumArray, 6, 'array has length of 6');
                    assert.sameMembers(sumArray, [1,10,20,2,10,20],'array should have [1,10,20,2,10,20] as members');
                    assert.equal(sumArray[5], 20, 'the last element returned should be 14');

                });
        });

        it("Run with ParallelArrayRunner should operate correctly when passed a class method", function () {
            let s = new ParallelArrayRunner(ParallelArrayRunner.LAST_RETURN, 2);
            let addTwoNumbersInstance = new AddTwoNumbersClass();
            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run([1,2,3,4,5], addTwoNumbersInstance.run, addTwoNumbersInstance, 10)
                .then ( (sum) => {
                    assert.isNotArray(sum, 'return value should not be an array');
                    assert.equal(sum, 15, 'the last value returned should be 15');
                });
        });

        it("Run with ParallelArrayRunner should reject gracefully then the first parameter is not an array", function () {
            let s = new ParallelArrayRunner(ParallelArrayRunner.LAST_RETURN);

            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run({}, addTwoNumbers, null, 10)
                .then ( (result) => {
                        assert.fail('resolved', 'rejected', 'Method should have returned a rejected promise');
                    },
                    (err) => {
                        assert.include(err, 'Expected type array, but passed');
                    }
                );
        });

        it("Run with ParallelArrayRunner should reject gracefully then the second parameter is not a function", function () {
            let s = new ParallelArrayRunner(ParallelArrayRunner.LAST_RETURN);

            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run([1,2,3,4], {}, null, 10)
                .then ( (result) => {
                        assert.fail('resolved', 'rejected', 'Method should have returned a rejected promise');
                    },
                    (err) => {
                        assert.include(err, 'Expected type function, but passed');
                    }
                );
        });


    });

});

