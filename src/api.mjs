import axios from 'axios'
import * as util from 'util'

class ApiError extends Error {
  constructor(message, data) {
    super(message)
    this.message = message
    this.name = "ApiError"
    this.data = data
  }
}

export async function badRequest() {
  try {
    let response = await axios.get('https://badhostname.mysite.com')
    //This shouldn't ever fire
    console.log(response)
    return response
  }
  catch(error) {
    console.log("Connection error")
    throw new ApiError(error, {
      errorCode: 900,
      errorMsg: error
    })
  }
}

export async function requestWithError() {
  try {
    let response = await axios.get('https://dog.ceo/api/breed/notabreed/images/random')
    console.log(response)
    //This may be unnecessary for this specific API, because it may be consistent
    //about returning meaningful HTTP codes and Axios interprets 4xx and 5xx as
    //errors
    if (response.status === "error") {
      throw new ApiError(response.message, {
        errorCode: response.code,
        errorMsg: response.message
      })
    }
    return response
  }
  catch(error) {
    console.log("Connection error")
    console.log(util.inspect(error))
    throw new ApiError(error, {
      errorCode: typeof(error.response.status) !== "undefined" ? error.response.status : 520,
      errorMsg: error.response.message
    })
  }
}

//Good request
//https://dog.ceo/api/breed/appenzeller/images/random
export async function goodRequest() {
  try {
    let response = await axios.get('https://dog.ceo/api/breed/appenzeller/images/random')
    console.log(response)
    //This may be unnecessary for this specific API, because it may be consistent
    //about returning meaningful HTTP codes and Axios interprets 4xx and 5xx as
    //errors
    if (response.status === "error") {
      throw new ApiError(response.message, {
        errorCode: response.code,
        errorMsg: response.message
      })
    }
    return response
  }
  catch(error) {
    console.log("Connection error")
    console.log(util.inspect(error))
    throw new ApiError(error, {
      errorCode: typeof(error.response.status) !== "undefined" ? error.response.status : 520,
      errorMsg: error.response.message
    })
  }
}