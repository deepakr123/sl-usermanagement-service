const csv = require("csvtojson");
const platformUserRolesHelper = require(ROOT_PATH + "/module/platformUserRoles/helper")
const FileStream = require(ROOT_PATH + "/generics/fileStream");

module.exports = class PlatformUserRoles extends Abstract {
  constructor() {
    super(platformUserRolesSchema);
  }

  static get name() {
    return "platformUserRoles";
  }

  /**
  * @api {get} /user-management/api/v1/platformUserRoles/getProfile/{{userId}} Get user profile
  * @apiVersion 1.0.0
  * @apiName Get user profile
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /user-management/api/v1/platformUserRoles/getProfile/e97b5582-471c-4649-8401-3cc4249359bb
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
      "_id": "5da6e08f436f9f3cd80b57b9",
      "roles": [
          {
              "roleId": "5da580c746b88419104d8728",
              "code": "OBS_DESIGNER"
          },
          {
              "roleId": "5da580dc46b88419104d8737",
              "code": "OBS_REVIEWERS"
          }
      ],
      "status": "active",
      "updatedBy": "e97b5582-471c-4649-8401-3cc4249359bb",
      "createdBy": "e97b5582-471c-4649-8401-3cc4249359bb",
      "userId": "e97b5582-471c-4649-8401-3cc4249359bb",
      "username": "a1",
  * }
  */

  getProfile(req) {
    return new Promise(async (resolve, reject) => {

      try {
          
        let queryObject = {
          userId: (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
          status: "active"
          }

        let platformUserRolesDocument = await database.models.platformUserRolesExt.findOne(
          queryObject
        ).lean();

        if(!platformUserRolesDocument){
          return resolve({
            message:"No platform user for given params",
            status:400
          })
        }

        return resolve({
          message: "Platform user profile fetched successfully.",
          result: platformUserRolesDocument
        });

      } catch (error) {

        return reject({
          status: error.status || 500,
          message: error.message || "Oops! something went wrong.",
          errorObject: error
        })

      }

    })
  }

  /**
  * @api {post} /user-management/api/v1/platformUserRoles/bulkCreate Bulk Upload User Roles
  * @apiVersion 1.0.0
  * @apiName Bulk Upload User Roles
  * @apiGroup User Extension
  * @apiParam {File} platformUserRoles Mandatory user roles file of type CSV.
  * @apiSampleRequest /user-management/api/v1/platformUserRoles/bulkCreate
  * @apiUse successBody
  * @apiUse errorBody
  */

  bulkCreate(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let userRolesCSVData = await csv().fromString(req.files.platformUserRoles.data.toString());

        if (!userRolesCSVData || userRolesCSVData.length < 1) throw "File or data is missing."

        let newUserRoleData = await platformUserRolesHelper.bulkCreate(userRolesCSVData, req.userDetails);

        if (newUserRoleData.length > 0) {

          const fileName = `UserRole-Upload`;
          let fileStream = new FileStream(fileName);
          let input = fileStream.initStream();

          (async function () {
            await fileStream.getProcessorPromise();
            return resolve({
              isResponseAStream: true,
              fileNameWithPath: fileStream.fileNameWithPath()
            });
          }());

          await Promise.all(newUserRoleData.map(async userRole => {
            input.push(userRole)
          }))

          input.push(null)

        } else {
          throw "Something went wrong!"
        }

      } catch (error) {

        return reject({
          status: error.status || 500,
          message: error.message || "Oops! something went wrong.",
          errorObject: error
        })

      }


    })
  }

  /**
  * @api {post} /user-management/api/v1/platformUserRoles/bulkUpdate Bulk Upload User Roles
  * @apiVersion 1.0.0
  * @apiName Bulk Upload User Roles
  * @apiGroup User Extension
  * @apiParam {File} platformUserRoles Mandatory user roles file of type CSV.
  * @apiSampleRequest /user-management/api/v1/platformUserRoles/bulkUpdate
  * @apiUse successBody
  * @apiUse errorBody
  */

  bulkUpdate(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let userRolesCSVData = await csv().fromString(req.files.platformUserRoles.data.toString());

        if (!userRolesCSVData || userRolesCSVData.length < 1) throw "File or data is missing."

        let newUserRoleData = await platformUserRolesHelper.bulkUpdate(userRolesCSVData, req.userDetails);

        if (newUserRoleData.length > 0) {

          const fileName = `UserRole-Upload`;
          let fileStream = new FileStream(fileName);
          let input = fileStream.initStream();

          (async function () {
            await fileStream.getProcessorPromise();
            return resolve({
              isResponseAStream: true,
              fileNameWithPath: fileStream.fileNameWithPath()
            });
          }());

          await Promise.all(newUserRoleData.map(async userRole => {
            input.push(userRole)
          }))

          input.push(null)

        } else {
          throw "Something went wrong!"
        }

      } catch (error) {

        return reject({
          status: error.status || 500,
          message: error.message || "Oops! something went wrong.",
          errorObject: error
        })

      }


    })
  }

};
