const cloudinarys = require("../config/CloudnairyConfig")
const streamifier = require("streamifier")
const Cloudnairyservice = (filebuffer,folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinarys.uploader.upload_stream({
            resource_type: "auto",
            folder: folder
        },
            (error, result) => {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(result)
                }

            }
        );
        streamifier.createReadStream(filebuffer).pipe(stream)
    });
}
module.exports = Cloudnairyservice;