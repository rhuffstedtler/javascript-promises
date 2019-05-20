
// Wrapping everything in async so we can take advantage of 
// "await". Don't worry about that, I'll explain later.

async function main () {
  // import { createPromise } from './myPromise'
  // This is the entry point.

  console.log("Entering start.js")

  // See https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md
  // for some helpful details on terminology

  // Super simple promise - Writes some text and always
  // resolves
  const simplePromise = new Promise( (resolve, reject) => {
    console.log('Simple promise executing')
    resolve('simplePromise resolving OK')
  })

  //Simple promise that always rejects
  const brokenPromise = new Promise( (resolve, reject) => {
    console.log('Broken promise executing')
    reject('brokenPromise rejecting')
  })

  simplePromise.then( result => {
    console.log(`simplePromise resolved: ${result}`)
  })

  // You *must* use the .catch() method rather than trying to wrap things with
  // try/catch - because the promise is asynchronous the engine may no longer be
  // inside the try block by the time an exception is raised.
  // Supposedly async/await fixes this
  brokenPromise.then( result => {
    console.log("This will never fire")
  })
  .catch( error => {
    console.log(`broken Promise was rejected: ${error}`)
  })

  // Let's pause briefly to let those complete
  await sleep(500)

  // Once a promise has been fulfilled, calling it again, should 
  // just return the same state as before. In other words, the
  // function will not execute again.
  console.log("\n\n")
  console.log('*************************************')
  console.log("Calling same promises again: \n")
  simplePromise.then( result => {
    console.log(`simplePromise resolved: ${result}`)
  })

  brokenPromise.then( result => {
    console.log("This will never fire")
  })
  .catch( error => {
    console.log(`broken Promise was rejected: ${error}`)
  })

  // Let's pause briefly to let those complete
  await sleep(500)

  //Promises are often used for asynchronous calls like API connections
  //These are inherently unstable as the API might be down, overloaded,
  //etc.
  iffyPromise = new Promise( (resolve, reject) => {
    console.log('Iffy promise executing')
    //Let's simulate a 30% failure rate
    const myNum = getRandomInt(0, 10) + 1
    if (myNum <= 3) {
      console.log("Connection failed, rejecting")
      reject('iffyPromise rejecting')
    }
    else {
      console.log("Connection succeeded, resolving")
      resolve('iffyPromise resolving')
    }  
  })

  iffyPromise.then( result => {
    console.log(`We got lucky: ${result}`)
  })
  .catch( error => {
    console.log(`You've got bad, bad luck: ${error}`)
  })

  // Before we start trying to compose promises, we need to understand this
  // There are three things you can do in a promise:
  // 1. return another promise
  // 2. return a synchronous value (or undefined)
  // 3. throw a synchronous error
  //
  // If you are trying to do anything else that depends on some kind of side
  // effect, that's an anti-pattern
  // Got the above from https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html
  // I'd actually swap 2 & 1 to make it easier to understand
  //
  // Functions in JS that don't explicitly return something implicitly return undefined
  // that can bite you with promises. ALWAYS return something.
  



  console.log("\n\n")
  console.log("Examples with Promise.all\n")
  //If you run the script at this point, you'll see that the order in which
  //the promises execute (or at least the order in which they are settled)
  //is not deterministic
  //TODO: Write another set of calls that show this off

  //NOTE: The executor function (the argument to the Promise constructor)
  //begins to execute immediately, before the Promise is returned. See section
  //25.4.3.1 of the ES6 spec. 
  //If, for some reason you need to not begin executing the function
  //immediately, you should create a Promise factory

  // Sometimes, you want to hold off on any processing until all of
  // your promises have resolved. Promise.all() is handy for this. 
  // It will return either as soon as a promise has rejected or once
  // all promises have resolved
  const promisesArray = [
    simplePromiseFactory(),
    iffyPromiseFactory(),
    brokenPromiseFactory()
  ]

  //TODO: Describe the function of await here
  let responses = null
  try {
    responses = await Promise.all(promisesArray);
    //Won't ever happen with this set because of brokenPromiseFactory
    console.log(`responses after all succeeded: ${responses}`)
  }
  catch (error) {
    console.log("In error handler")
    console.log(error)
    //This will be null because the assignment never executed
    console.log(responses)
  }
  
  // An example that should complete, if the iffy function is
  // successful
  const promisesArray2 = [
    simplePromiseFactory(),
    iffyPromiseFactory()
  ]
  try {
    responses = await Promise.all(promisesArray2);
    //Won't ever happen with this set because of brokenPromiseFactory
    console.log(`responses after all succeeded: ${responses}`)
  }
  catch (error) {
    console.log("In error handler")
    console.log(error)
    //This will be null because the assignment never executed
    console.log(responses)
  }
  
}

main()



// Some utility functions that are here just to make the demonstration
// easier
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// The new ES6 way of doing things.
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Just here to demonstrate that it implicitly returns undefined
function whatsMyReturn () {
  const sum = 1 + 5
}

//These are here to save me a lot of cut and paste repetition

//simplePromiseBody
const simplePromiseBody = (resolve, reject) => {
  console.log('Instance of Simple promise executing')
  resolve('Instance of simplePromise resolving OK')
}
function simplePromiseFactory() {
  return new Promise(simplePromiseBody);
}

const brokenPromiseBody = async (resolve, reject) => {
  await sleep(100)
  console.log('Instance of Broken promise executing')
  reject({
    errorCode: 500,
    errorMsg: 'Instance of brokenPromise rejecting'
  })
}
function brokenPromiseFactory() {
  return new Promise(brokenPromiseBody);
}

const iffyPromiseBody = (resolve, reject) => {
  console.log('Instance of Iffy promise executing')
    //Let's simulate a 30% failure rate
    const myNum = getRandomInt(0, 10) + 1
    if (myNum <= 3) {
      console.log("Connection failed, rejecting")
      reject('iffyPromise rejecting')
    }
    else {
      console.log("Connection succeeded, resolving")
      resolve('iffyPromise resolving')
    }  
}
function iffyPromiseFactory() {
  return new Promise(iffyPromiseBody);
}
