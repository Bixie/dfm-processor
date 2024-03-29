# DFM file processor

Process param and output files of DFM

[Web Client](https://github.com/Bixie/dfm-app) - [Server API](https://github.com/Bixie/dfm-api) - [Nodejs Processor](https://github.com/Bixie/dfm-processor)

See [PARAMETERS.md](PARAMETERS.md) for details on DFM parameters.

### Install

**Dependencies**

- NodeJs 16.x
- Git
    - Bash
    - Tools
- (Notepad++)
- (FileZilla)

Global NPM packages 

- npm
- node-windows

**Environment variables**

The program need the following global enviromental variables to be set.

```
NODE_ENV                    //Set to 'production' or 'development'
DFM_APP_PORT                //Port the server will be listening
DFM_APP_PATH                //Path where the processor is installed
DFM_DB_PATH                 //Path where the sqlite3 data file is stored
DFM_INPUT_PORT_CSI          //Port where DFM for CSI is listening
DFM_INPUT_PORT_YAHOO        //Port where DFM for Yahoo is listening
DFM_INPUT_PATH_CSI          //Path for CSI requests
DFM_INPUT_PATH_YAHOO        //Path for Yahoo requests
DFM_PARAMSFILES_PATH        //Path where DFM application will listen for params files (deprecated v1)
DFM_LICENSEFILES_PATH       //Path where License application will listen for license files
DFM_PARAMSFILES_ARCHIVE_PATH//Path where params files will be archived
DFM_OUTPUT_FILENAME_PREFIX  //Prefix in front of the unique preview ID in the file
DFM_OUTPUT_FILENAME_SUFFIX  //Suffix for outputfiles default `_%d_%d` where first number is index of outputfile (1 based), and the second the total number of outputfiles
DFM_IMAGEFILES_OUTPUT_PATH  //Path where DFM application outputs the image files
ZIPFILES_OUTPUT_PATH        //Path where DFM application outputs the zip files
DFM_IMAGEFILES_SENT_PATH    //Path to backup sent files to
DFM_WEBSERVER_LOCAL_PATH    //Path of images-folder of webserver when webserver runs on the same machine. False otherwise
DFM_INTERNAL_API_HOST       //URL of Internal API on webserver
DFM_INTERNAL_API_KEY        //API key used for Internal API
```

Make sure above variables are set!
Use git/npm to install the client.

```
git clone https://github.com/Bixie/dfm-processor
cd dfm-processor
npm install
```

## Run as Windows Service

Install [node-windows](https://www.npmjs.com/package/node-windows) globally.

Then activate the link in the application folder

```
cd %DFM_APP_PATH%
npm link node-windows
```

Run service installer.

```npm run install:service```

Now you can run the Service "dfm-processor" from the Windows services window, or via cli.

```NET START dfm-processor```

Uninstall the service.

```npm run uninstall:service```

These scripts may ask for user-permissions multiple times.

### Run with debug output

Make sure the service is not running, or the port will be in use.
```
cd %DFM_APP_PATH%
set NODE_ENV=development
npm start
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
npm install
```

Restart the service after updating!

### Filename formats

#### Legacy application

Processing requests have an unique ID that comes together with the paramater-set from the webserver. The ID has a
static prefix (`dfm_preview`) and a random string of length 13 following that. The requested language is added after that. The parameters are stored in a file
named `<prefix><id>_[EN|NL].txt` (eg `dfm_preview5b785cb49b952.txt`). The combination `<prefix><id>` is the _preview_id_.

Output files need to be named starting with the input filename, with a suffix indicating the number of outputfiles
in the set. Suffix can be `_%d_%d`, where first number is index of outputfile (1 based), and the second the total 
number of outputfiles for the _preview_id_. 
Example: `dfm_preview5b785cb49b952_EN_1_3.png`, `dfm_preview5b785cb49b952_EN_2_3.png`, `dfm_preview5b785cb49b952_EN_3_3.png` 
as a set for _preview_id_ `dfm_preview5b785cb49b952`.

#### Full application

Output files are zipfiles with all the response files. The name should be the `preview ID` that is given as `id` in the query
string, eg `dfm_preview5b785cb49b952.zip`. ([parameters](https://github.com/Bixie/dfm-processor/blob/master/PARAMETERS.md#voorbeeld-met-standaardwaarden))

Chart and data files can be nested in folders in the zip files.

To return an error from the calculation, only return the file `error.txt` in the zip response. The message in the file will 
be displayed to the user.

### Watchlists

Stored in Sqlite3 database file at location specified in `DFM_DB_PATH`.

#### Records

```
id: integer
user_id: integer
name: string
item_count: integer
items: JSON text
```

