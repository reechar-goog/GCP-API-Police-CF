/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 'use strict';
const { google } = require('googleapis');
const servicemanagement = google.servicemanagement('v1');

let authenticationClient;
getAuthClient();

function getAuthClient() {
  google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/compute',
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/service.management']
  }).then(function (authClient) {
    authenticationClient = authClient;
  })
}

exports.apiPolice = (event, callback) => {
  const pubsubMessage = event.data;
  const cloudAuditLogMsg = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString())

  const accountID = cloudAuditLogMsg.protoPayload.authenticationInfo.principalEmail
  var apiName;
  if (cloudAuditLogMsg.protoPayload.methodName == 'google.api.servicemanagement.v1.ServiceManager.ActivateServices'){
    var resourceName = cloudAuditLogMsg.protoPayload.resourceName;
    apiName = resourceName.substring(resourceName.indexOf('[')+1, resourceName.indexOf(']'))
  } else {
    apiName = cloudAuditLogMsg.protoPayload.request.serviceName;
  }
  const projectID = "project:" + cloudAuditLogMsg.resource.labels.project_id

  const blockedList = ['translate.googleapis.com']

  console.log(`${accountID} attempted to activate ${apiName} in ${projectID}`)
  if (blockedList.indexOf(apiName) > -1) {
    console.error(`${apiName} is on the blocked API list and will be disabled`);
    servicemanagement.services.disable({ auth: authenticationClient, serviceName: apiName, requestBody: { consumerId: projectID } })
      .then(function (response) {
        callback(null, 'Success!');
      })
      .catch(function (error) {
        callback(new Error('Failed'));
      });
  } else {
    console.log(`${apiName} not blocked`);
    callback(null, 'Success!');
  }

}

exports.apiPoliceAllowedList = (event, callback) => {
  const pubsubMessage = event.data;
  const cloudAuditLogMsg = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString())

  const accountID = cloudAuditLogMsg.protoPayload.authenticationInfo.principalEmail
  const apiName = cloudAuditLogMsg.protoPayload.request.serviceName
  const projectID = "project:" + cloudAuditLogMsg.resource.labels.project_id

  const allowedList = ['bigquery-json.googleapis.com',
    'cloudapis.googleapis.com',
    'clouddebugger.googleapis.com',
    'cloudfunctions.googleapis.com',
    'cloudtrace.googleapis.com',
    'compute.googleapis.com',
    'datastore.googleapis.com',
    'logging.googleapis.com',
    'monitoring.googleapis.com',
    'oslogin.googleapis.com',
    'pubsub.googleapis.com',
    'servicemanagement.googleapis.com',
    'serviceusage.googleapis.com',
    'source.googleapis.com',
    'sql-component.googleapis.com',
    'storage-api.googleapis.com',
    'storage-component.googleapis.com',
    'vision.googleapis.com'] //vision.googleapis.com not part of default enable APIs, here for example only

  console.log(`${accountID} attempted to activate ${apiName} in ${projectID}`)
  if (allowedList.indexOf(apiName) > -1) {
    console.log(`${apiName} is in the allowed list`);
    callback(null, 'Success!');
  } else {
    console.error(`${apiName} not in allowed list and will be disabled`);
    servicemanagement.services.disable({ auth: authenticationClient, serviceName: apiName, requestBody: { consumerId: projectID } })
      .then(function (response) {
        callback(null, 'Success!');
      })
      .catch(function (error) {
        callback(new Error('Failed'));
      });
  }
}

