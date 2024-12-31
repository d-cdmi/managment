# Login you hostinger account

+ enble SSH access and change the SSH access password

+ your react project build and upload to thedhruvish.com in public_html dircets

+ create a ```.htacccess``` file write following

```bash
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-f

RewriteCond %{REQUEST_FILENAME} !-d

RewriteRule . index.html
```

## create a sub domain like `api.thedhruvish.com`

## create a mysql data base

+ save the `MySQL database name` `MySQL username` `Password`

## access the terminal on your hostinger account

+ Goto the this path `/home/u441../domains/thedhruvish.com` and clone your backend project in `api.thedhruvish.com` folder.

```bash
git clone https://github.com/d-cdmi/managment.git api.thedhruvish.com
```

+ change the composer version into 2.0.0 togo composer website

```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('sha384', 'composer-setup.php') === 'dac665fdc30fdd8ec78b38b9800061b4150413ff2e3b6f88543c636f7cd84f6db9189d43a81e5503cda447da73c7e5b6') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"
```

## install composer and install dependencies and `.env` file create and edit

+ check local composer version
+ install dependencies
+ create a `.env` file
+ edit file to open vim editor

```bash
php composer.phar --version

php composer.phar install

cp .env.example .env

vim .env
```

+ type `i` button to editor .env file and change `APP_NAME` `APP_ENV` `APP_DEBUG` `APP_URL`

```bash
APP_NAME="my app"
APP_ENV=prod
APP_DEBUG=false
APP_URL=https://api.thedhruvish.com

#DB config

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=

```

+ save this file type `ESC` key and type  `:wq`

## php setting

```bash
php artisan key:generate --ansi

php artisan migrate
```

## create a symbolink

+ Go to the `/home/u441../domains/thedhruvish.com` folder simbl link create

```bash
rm -rf api
ln -s ~/domains/api.thedhruvish.com/public api
```

## how to clear cache

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear
php artisan clear-compiled
php artisan optimize:clear

```
