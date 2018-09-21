# DFM file processor

Process param and output files of DFM

[Web Client](https://github.com/Bixie/dfm-app) - [Server API](https://github.com/Bixie/dfm-api) - [Nodejs Processor](https://github.com/Bixie/dfm-processor)

### Install

**Dependencies**

- NodeJs 8.x
- Git 8.2
    - Bash
    - Tools
- (Notepad++)
- (FileZilla)

Global NPM packages 

- yarn
- node-windows

**Environment variables**

The program need the following global enviromental variables to be set.

```
NODE_ENV                    //Set to 'production' or 'development'
DFM_APP_PORT                //Port the server will be listening
DFM_APP_PATH                //Path where the processor is installed
DFM_PARAMSFILES_PATH        //Path where DFM application will listen for params files
DFM_PARAMSFILES_ARCHIVE_PATH//Path where params files will be archived
DFM_OUTPUT_FILENAME_PREFIX  //Prefix in front of the unique preview ID in the file
DFM_OUTPUT_FILENAME_SUFFIX  //Suffix for outputfiles default `_%d_%d` where first number is index of outputfile (1 based), and the second the total number of outputfiles
DFM_IMAGEFILES_OUTPUT_PATH  //Path where DFM application outputs the files
DFM_IMAGEFILES_SENT_PATH    //Path to backup sent files to
DFM_WEBSERVER_LOCAL_PATH    //Path of images-folder of webserver when webserver runs on the same machine. False otherwise
DFM_INTERNAL_API_HOST       //URL of Internal API on webserver
DFM_INTERNAL_API_KEY        //API key used for Internal API
```

Make sure above variables are set!
Use git/yarn to install the client.

```
git clone https://github.com/Bixie/dfm-processor
cd dfm-processor
yarn install
```

## Run as Windows Service

Install [node-windows](https://www.npmjs.com/package/node-windows) globally.

Link the package to the install directory. First create the link in the global package:
```
cd %USERPROFILE%/AppData/Roaming/npm/node_modules/node-windows
yarn link
```
Then activate the link in the application folder
```
cd %DFM_APP_PATH%
yarn link node-windows
```

Run service installer.

```yarn run install:service```

Now you can run the Service "dfm-processor" from the Windows services window, or via cli.

```NET START dfm-processor```

Uninstall the service.

```yarn run uninstall:service```

These scripts may ask for user-permissions multiple times.

### Run with debug output

Make sure the service is not running, or the port will be in use.
```
cd %DFM_APP_PATH%
set NODE_ENV=development
yarn start
```

### Logs

Logs will be stored in the `../logs` folder (one up from the appliciations directory).

### Updating

Update the processor via Git.

```
cd %DFM_APP_PATH%
git fetch origin master
git reset --hard FETCH_HEAD
git clean -df
yarn install
```

Restart the service after updating!

### Filename formats

Processing requests have an unique ID that comes together with the paramater-set from the webserver. The ID has a
static prefix (`dfm_preview`) and a random string of length 13 following that. The parameters are stored in a file
named `<prefix><id>.txt` (eg `dfm_preview5b785cb49b952.txt`). The combination `<prefix><id>` is the _preview_id_.

Output files need to be named starting with the _preview_id_, with a suffix indicating the number of outputfiles
in the set. Suffix can be `_%d_%d`, where first number is index of outputfile (1 based), and the second the total 
number of outputfiles for the _preview_id_. 
Example: `dfm_preview5b785cb49b952_1_3.png`, `dfm_preview5b785cb49b952_2_3.png`, `dfm_preview5b785cb49b952_3_3.png` 
as a set for _preview_id_ `dfm_preview5b785cb49b952`.
