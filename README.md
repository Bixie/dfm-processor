# DFM file processor

Process param and output files of DFM

### Install

**Dependancies**

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

### Logs

Logs will be stored in the `../logs` folder (one up from the appliciations directory).

### Updating

Update the processor via Git.

```
cd %DFM_APP_PATH%
git fetch origin master
git reset --hard FETCH_HEAD
git clean -df
```

Restart the service after updating!