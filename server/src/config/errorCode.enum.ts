export enum ERROR_CODE {
  'NOT_DUPLICATED_NICKNAME' = 1000,
  'DUPLICATED_NICKNAME' = 1001,
  'SERVER_ERROR' = 5000,
  'SERVICE_ERROR' = 5001,
  'MUSIC_ENCODE_ERROR' = 5002,
  'ENCODED_MUSIC_UPLOAD_ERROR' = 5003,
  'QUERY_ERROR' = 5004,
  'ENTITY_ERROR' = 5005,
  'NOT_EXIST_PLAYLIST_ON_USER' = 4001,
  'NOT_EXIST_MUSIC' = 4002,
  'ALREADY_ADDED' = 4003,
  'INVALID_INPUT_UUID_VALUE' = 4004,
  'NOT_EXIST_USER' = 4005,
  'ALREADY_EXIST_EMAIL' = 4006,
  'NOT_EXIST_GENRE' = 4007,
  'INVALID_INPUT_TYPE_VALUE' = 4008,
  'NOT_EXIST_MUSIC_ID' = 4009,
  'NOT_EXIST_TS_IN_BUCKET' = 4010,
  'INVALID_GREEN_EYE_REQUEST' = 4011,
  'FAIL_GREEN_EYE_IMAGE_RECOGNITION' = 4012,
  'BAD_IMAGE' = 4013,
  'NOT_ADDED_MUSIC' = 4014,
  'WRONG_TOKEN' = 4100,
  'EXPIRED_TOKEN' = 4101,
  'NOT_EXIST_REFRESH_TOKEN' = 4102,
}
