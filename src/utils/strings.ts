/**
 * Class that defines variables with default values.
 *
 * @see Variables defined in .env will have preference.
 * @see Be careful not to put critical data in this file as it is not in .gitignore.
 * Sensitive data such as database, passwords and keys should be stored in secure locations.
 *
 * @abstract
 */
export abstract class Strings {
    public static readonly APP: any = {
        TITLE: 'Notification Service',
        APP_DESCRIPTION: 'Micro-service for sending notification of type email, sms and push.'
    }

    public static readonly USER: any = {
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {user_id} is not in valid format!'
    }

    public static readonly EMAIL: any = {
        NOT_FOUND: 'Email not found!',
        NOT_FOUND_DESCRIPTION: 'Email not found or already removed. A new operation for the same resource is not required.',
        REGNUTES_SENDER_NAME: 'regNUTES',
        OPERAPB_SENDER_NAME: 'Opera PB'
    }

    public static readonly EMAIL_TEMPLATE: any = {
        NOT_FOUND: 'Email template not found!',
        NOT_FOUND_DESCRIPTION: 'Email template not found or already removed. A new operation for the same resource is not required.'
    }

    public static readonly PUSH: any = {
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {push_id} is not in valid format!'
    }

    public static readonly ERROR_MESSAGE: any = {
        REQUEST_BODY_INVALID: 'Unable to process request body!',
        REQUEST_BODY_INVALID_DESC: 'Please verify that the JSON provided in the request body has a valid format and try again.',
        ENDPOINT_NOT_FOUND: 'Endpoint {0} does not found!',
        VALIDATE: {
            REQUIRED_FIELDS: 'Required fields were not provided...',
            REQUIRED_FIELDS_DESC: '{0} are required!',
            UUID_NOT_VALID_FORMAT: 'Some ID provided does not have a valid format!',
            UUID_NOT_VALID_FORMAT_DESC: 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.',
            INVALID_FIELDS: 'One or more request fields are invalid...',
            INVALID_STRING: '{0} must be a string!',
            EMPTY_STRING: '{0} must have at least one character!',
            NOT_MAPPED: 'Value not mapped for {0}:',
            NOT_MAPPED_DESC: 'The mapped values are:',
            AT_LEAST_ONE_RECIPIENT: 'At least one recipient is required.',
            AT_LEAST_ONE_RECIPIENT_DESC: 'Please enter at least one user id for direct notifications or at least one topic name for topic notifications.',
            USER_HAS_NO_PUSH_TOKEN: 'Some user ids do not have saved push tokens for any type of client: {0}.',
            USER_HAS_NO_PUSH_TOKEN_DESC: 'Please submit a valid user id and try again.',
            INVALID_EMAIL: 'Email "{0}" does not have a valid format!',
            INVALID_TO: 'The "to" field is not in valid format!',
            INVALID_TO_DESC: 'The {0} attribute is required.',
            EMPTY_ATTACHMENTS: 'At least one file is required in attachments',
            EMPTY_TO: 'The to field requires at least one recipient with an email address!',
            REQUIRED_REPLY_EMAIL: 'The reply field requires that the object have email!',
            REQUIRED_TO_EMAIL: 'The to field requires an array of recipients with a email address!',
            REQUIRED_CC_EMAIL: 'The cc field requires an array of recipients with a email address!',
            REQUIRED_BCC_EMAIL: 'The bcc field requires an array of recipients with a email address!',
            REQUIRED_ATTACHMENTS_PATH: 'The attachment field requires a variety of attachments with at least the file path or URL.'
        }
    }

    public static readonly FIREBASE_ADMIN_ERROR: any = {
        INVALID_PAYLOAD: 'Some invalid argument was provided into the message parameters.',
        PAYLOAD_LIMIT_EXCEEDED: 'The maximum message size has been reached.',
        INVALID_TOKEN: 'The recipient token is invalid: {0}',
        INVALID_TOKEN_DESC: 'Please provide a new token to recipient and try again later.',
        TOKEN_NOT_REGISTERED: 'The recipient is not registered: {0}',
        TOKEN_NOT_REGISTERED_DESC: 'Probably the token has been expired or deleted. Please provide a new token and try again later.',
        MESSAGE_RATE_EXCEEDED: 'The maximum message rate has been reached for the destination: {0}.',
        MESSAGE_RATE_EXCEEDED_DESC: 'Please wait for a while before resending messages to this destination again.',
        DIRECT_MESSAGE_RATE_EXCEEDED: 'The maximum message rate has been reached for token: {0}.',
        DIRECT_MESSAGE_RATE_EXCEEDED_DESC: 'Please wait for a while before resending messages to this token again.',
        TOPICS_MESSAGE_RATE_EXCEEDED: 'The maximum message rate has been reached for topic: {0}.',
        TOPICS_MESSAGE_RATE_EXCEEDED_DESC: 'Please wait for a while before resending messages to this topic again.',
        MISMATCHED_CREDENTIAL: 'The credential used into Firebase Admin SDK is not allowed to send messages to the push token: {0}',
        MISMATCHED_CREDENTIAL_DESC: 'Please verify if the push token and the SDK credential belonging to the same project.',
        AUTHENTICATION_ERROR: 'The Firebase Admin SDK could not connect with the FCM Server.',
        AUTHENTICATION_ERROR_DESC: 'Please verify your SDK credentials and try again.',
        SERVER_UNAVAILABLE: 'The FCM Server is unavailable now. PLease try again later.',
        INTERNAL_ERROR: 'The FCM server encountered an error while trying to process the request. Please try again later.',
        INVALID_CREDENTIALS: 'Failed to determine the project ID. ' +
            'Please verify that Google Application Credentials has been configured correctly.',
        UNKNOWN_ERROR: 'An unknown error has occurred. Please try again later.'
    }
}
