import axios from 'axios'
import { GenerateGuid } from './generate.uid'

/*
how to test this function:
https://firebase.google.com/docs/functions/local-shell#invoke_https_functions
  send POST request with form data and authorization 
  listenToChainUpdates({method:'post',url:'/',headers:{authorization:'123'}}).form( {foo: 'bar' })
 */

export async function listenToChainUpdates(request, response, db, env) {
  if (request.method !== 'POST') {
    return response
      .status(405)
      .type('application/json')
      .send({ message: 'Method Not Allowed' })
  }
  if (request.path !== '/') {
    return response
      .status(405)
      .type('application/json')
      .send({ message: 'Path Not Allowed' })
  }
  console.log(request.headers); // debug
  if (
    !request.headers.authorization ||
    !env.chainmonitor ||
    !env.chainmonitor.authkey ||
    request.headers.authorization !== env.chainmonitor.authkey
  ) {
    return response.status(403).send('Unauthorized')
  }  

  console.log(request.body);
  
  return response
    .status(200)
    .type('application/json')
    .send({ status: 'ok' })
}