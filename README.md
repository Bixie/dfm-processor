# DFM file processor

Process param and output files of DFM

[Web Client](https://github.com/Bixie/dfm-app) - [Server API](https://github.com/Bixie/dfm-api) - [Nodejs Processor](https://github.com/Bixie/dfm-processor)

See [PROTOCOL.md](PROTOCOL.md) for the wire formats — the endpoints served, the engine request, the
output archive, the watchlist table and the licence files. It is the source of truth for all of them.

The parameters themselves are the plugin's: `PARAMETERS.md` in `dfm-core`, generated from
`Api\EngineQuery`, is where a form field's route onto the wire is written down. Nothing here reads a
parameter name any more — the query string arrives built and is relayed unparsed (task 23), so this
repo's own stale copy of that document is gone.

### Install

**Dependencies**

- NodeJs 22.x LTS
- Git
    - Bash
    - Tools
- (Notepad++)
- (FileZilla)

Global NPM packages

- npm
- **node-windows** — deliberately *not* in `package.json`. It only builds on Windows, and this repo
  is developed and checked on Linux, where `npm install` would fail on it. `scripts/install-service.js`
  and `scripts/uninstall-service.js` are the only files that require it, and they only ever run on the
  engine machine. Install it globally and link it there — see *Run as Windows Service* below.

**Environment variables**

The program need the following global enviromental variables to be set. `config.js` is the definitive
list — every one of them is read there, and nothing reads a variable that is not.

```
NODE_ENV                    //Set to 'production' or 'development'
DFM_APP_PORT                //Port the server will be listening
DFM_APP_PATH                //Path where the processor is installed
DFM_DB_PATH                 //Path where the sqlite3 data file is stored
DFM_INPUT_HOST              //Host of the DFM engine's web interface, scheme included
DFM_ENGINE_PORT_MAIN        //Port where the DFM engine is listening
DFM_ENGINE_PATH_MAIN        //Path the engine serves calculation requests on
DFM_LICENSEFILES_PATH       //Path where License application will listen for license files
DFM_OUTPUT_FILENAME_PREFIX  //Prefix in front of the unique preview ID in the file
ZIPFILES_OUTPUT_PATH        //Path where DFM application outputs the zip files
DFM_RESPONSES_SENT_PATH     //Path to move delivered archives to
DFM_INTERNAL_API_HOST       //URL of Internal API on webserver
DFM_INTERNAL_API_KEY        //API key used for Internal API
```

Seven variables left this list in task 23 and none of them has a reader any more:
`DFM_INPUT_PORT_CSI`/`_YAHOO` and `DFM_INPUT_PATH_CSI`/`_YAHOO` became the single
`ENGINE_TARGETS.main` entry above — one engine machine, named by the request rather than chosen by
the data provider ([PROTOCOL.md](PROTOCOL.md) §3) — while `DFM_PARAMSFILES_PATH`,
`DFM_PARAMSFILES_ARCHIVE_PATH`, `DFM_OUTPUT_FILENAME_SUFFIX`, `DFM_IMAGEFILES_OUTPUT_PATH` and
`DFM_WEBSERVER_LOCAL_PATH` belonged to the v1 file-drop and image-set paths that went with it. Setting
any of them now does nothing at all; leaving them set on the engine machine is harmless.

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
npm ci
```

Restart the service after updating!

**`npm ci`, not `npm install`.** `package-lock.json` is committed, and `ci` installs exactly what it
says; `install` is free to resolve anything the `^` ranges allow, which is how this repo ended up
running 2021 packages under a 2025 manifest for four years. If `ci` refuses, the lockfile and
`package.json` genuinely disagree and that is worth reading rather than working around.

**`sqlite3` is the one native module,** and it fetches a prebuilt binary rather than compiling —
`prebuild-install` pulls `napi-v6-<platform>` into `node_modules/sqlite3/build/Release/`. Being N-API
is why it survives a Node major without a rebuild. If the fetch fails on the engine machine (no
network to GitHub, or a platform with no published build) it falls back to compiling from source,
which needs the MSVC build tools that are not otherwise a requirement here. A failed
`npm ci` on that machine is far more likely to be this than anything in the repo.

### Filename formats

#### Legacy application — history, not description

The v1 flow dropped a parameter file for the engine to pick up and collected loose output files back:
parameters in `<prefix><id>_[EN|NL].txt`, and one image per chart named
`dfm_preview5b785cb49b952_EN_1_3.png` … `_3_3.png`, a `_%d_%d` suffix carrying the index and the total
so a set could be recognised as complete. `<prefix><id>` is the _preview_id_ and still is.

**None of that is implemented any more.** The code that assembled those sets — the grouped file
watcher, its filename regex and its per-preview queues — went in task 23, along with the four paths it
needed. It is written down here because six years of the engine's own documentation describes it, and
because the naming rule that survived is the one below.

#### Full application

The engine writes one zipfile per calculation, named for the `preview ID` it was given as `id` in the
query string, eg `dfm_preview5b785cb49b952.zip`. (A request with every parameter at the form's own
default is the worked example in `dfm-core`'s `PARAMETERS.md`; the query itself is
[PROTOCOL.md](PROTOCOL.md) §3.)

That archive is now forwarded to the webserver **byte for byte** — never opened, never repacked. So
what the engine writes is what the browser reads, and two things that used to be this program's
business are the receiving side's: entry names are normalised in PHP
(`Api\PreviewZip::normalizeName()`, [PROTOCOL.md](PROTOCOL.md) §4) and the charts are drawn in the
browser from the data files rather than rendered here.

Chart and data files can be nested in folders in the zip files; the receiver reads entries by
basename, so nesting is invisible to the app either way.

To return an error from the calculation, only return the file `error.txt` in the zip response. The message in the file will 
be displayed to the user. Any entry whose name *contains* `error` is displayed, which is how this
program reports a failure the webserver cannot see — a one-entry archive holding `error_processor.txt`
([PROTOCOL.md](PROTOCOL.md) §5). Do not name a data file that way.

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

