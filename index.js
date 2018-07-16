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
  const apiName = cloudAuditLogMsg.protoPayload.request.serviceName
  const projectID = "project:" + cloudAuditLogMsg.resource.labels.project_id

  const blacklist = ['translate.googleapis.com']

  console.log(`${accountID} attempted to activate ${apiName} in ${projectID}`)

  if (blacklist.indexOf(apiName) > -1) {
    console.error(`${apiName} is blacklisted and will be disabled`);
    servicemanagement.services.disable({ auth: authenticationClient, serviceName: apiName, requestBody: { consumerId: projectID } });
  } else {
    console.log(`${apiName} not in blacklist`);
  }
  callback();
}

exports.apiPoliceWhiteList = (event, callback) => {
  const pubsubMessage = event.data;
  const cloudAuditLogMsg = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString())

  const accountID = cloudAuditLogMsg.protoPayload.authenticationInfo.principalEmail
  const apiName = cloudAuditLogMsg.protoPayload.request.serviceName
  const projectID = "project:" + cloudAuditLogMsg.resource.labels.project_id

  const whitelist = ['bigquery-json.googleapis.com',
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
    'vision.googleapis.com'] //vision.googleapis.com not part of default enable APIs, here for exmaple only

  console.log(`${accountID} attempted to activate ${apiName} in ${projectID}`)
  if (whitelist.indexOf(apiName) > -1) {
    console.log(`${apiName} is whitelisted`);
  } else {
    console.error(`${apiName} not in whitelist and will be disabled`);
    servicemanagement.services.disable({ auth: authenticationClient, serviceName: apiName, requestBody: { consumerId: projectID } });
  }
  callback();
}

