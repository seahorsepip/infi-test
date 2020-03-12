# infi-test

## Install

```bash
$ npm install --global infi-test
```


## CLI

```
$ infi-test --help

  Usage
    $ infi-test

  Options
    --name, -n              (optional) Search camera by name
    --case-sensitive, -c    (optional) Compare with case sensitivity
    --web, -w               (optional) Start web server and show cameras in browser

  Examples
    $ infi-test
    Search camera by name

    $ infi-test --name=laan
    17 cameras found that match laan

    $ infi-test -n=laan -c=false
    18 cameras found that match laan

    $ infi-test -web
    Web server listening on port 3000!
```
