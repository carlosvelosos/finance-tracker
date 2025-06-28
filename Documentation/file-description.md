# Project Directory Structure

This document outlines the directory structure of the project.

## Table of Contents

- [`app/about`](#appabout)
- [`app/actions`](#appactions)
- [`app/amex`](#appamex)
- [`app/amex/chart`](#appamexchart)
- [`app/auth`](#appauth)
- [`app/auth/callback`](#appauthcallback)
- [`app/auth/forgot-password`](#appauthforgot-password)
- [`app/auth/login`](#appauthlogin)
- [`app/auth/reset-password`](#appauthreset-password)
- [`app/auth/signup`](#appauthsignup)
- [`app/components`](#appcomponents)
- [`app/email-client`](#appemail-client)
- [`app/email-merge`](#appemail-merge)
- [`app/family`](#appfamily)
- [`app/global`](#appglobal)
- [`app/global/chart`](#appglobalchart)
- [`app/handelsbanken`](#apphandelsbanken)
- [`app/handelsbanken/category`](#apphandelsbankencategory)
- [`app/handelsbanken/category/chart`](#apphandelsbankencategorychart)
- [`app/inter`](#appinter)
- [`app/inter-account`](#appinter-account)
- [`app/inter-account/category`](#appinter-accountcategory)
- [`app/inter-account/category/chart`](#appinter-accountcategorychart)
- [`app/inter-account/info`](#appinter-accountinfo)
- [`app/profile`](#appprofile)
- [`app/recurrent`](#apprecurrent)
- [`app/sjprio`](#appsjprio)
- [`app/types`](#apptypes)
- [`app/unauthorized`](#appunauthorized)
- [`app/upload`](#appupload)
- [`app/welcome`](#appwelcome)

---

### `app/about`

- **Parent Directory:** `app`
- **Path:** `app/about`
- **Summary:** This directory likely contains the UI and logic for the "About" page of the application.

### `app/actions`

- **Parent Directory:** `app`
- **Path:** `app/actions`
- **Summary:** This directory probably holds server-side actions or functions that handle data manipulation and business logic, such as updating database records.

### `app/amex`

- **Parent Directory:** `app`
- **Path:** `app/amex`
- **Summary:** This directory is likely dedicated to features related to American Express accounts, such as displaying transactions and account details.

### `app/amex/chart`

- **Parent Directory:** `amex`
- **Path:** `app/amex/chart`
- **Summary:** Contains components for visualizing American Express account data.

### `app/auth`

- **Parent Directory:** `app`
- **Path:** `app/auth`
- **Summary:** This directory contains all authentication-related pages and logic.

### `app/auth/callback`

- **Parent Directory:** `auth`
- **Path:** `app/auth/callback`
- **Summary:** Handles the callback from the authentication provider.

### `app/auth/forgot-password`

- **Parent Directory:** `auth`
- **Path:** `app/auth/forgot-password`
- **Summary:** The page where users can request a password reset.

### `app/auth/login`

- **Parent Directory:** `auth`
- **Path:** `app/auth/login`
- **Summary:** The login page for users.

### `app/auth/reset-password`

- **Parent Directory:** `auth`
- **Path:** `app/auth/reset-password`
- **Summary:** The page where users can reset their password.

### `app/auth/signup`

- **Parent Directory:** `auth`
- **Path:** `app/auth/signup`
- **Summary:** The signup page for new users.

### `app/components`

- **Parent Directory:** `app`
- **Path:** `app/components`
- **Summary:** Contains reusable React components that are specific to certain pages or features within the `app` directory.

### `app/email-client`

- **Parent Directory:** `app`
- **Path:** `app/email-client`
- **Summary:** This directory likely contains the UI and logic for an email client feature within the application.

### `app/email-merge`

- **Parent Directory:** `app`
- **Path:** `app/email-merge`
- **Summary:** This directory is probably for a feature that merges emails, possibly for consolidating financial reports from different sources.

### `app/family`

- **Parent Directory:** `app`
- **Path:** `app/family`
- **Summary:** This directory may contain features related to family finance management, such as shared accounts or budgets.

### `app/global`

- **Parent Directory:** `app`
- **Path:** `app/global`
- **Summary:** This could be for global settings or data that applies across the entire application.

### `app/global/chart`

- **Parent Directory:** `global`
- **Path:** `app/global/chart`
- **Summary:** Contains chart components that are used globally across the application.

### `app/handelsbanken`

- **Parent Directory:** `app`
- **Path:** `app/handelsbanken`
- **Summary:** This directory is dedicated to features for Handelsbanken accounts.

### `app/handelsbanken/category`

- **Parent Directory:** `handelsbanken`
- **Path:** `app/handelsbanken/category`
- **Summary:** Manages transaction categories for Handelsbanken accounts.

### `app/handelsbanken/category/chart`

- **Parent Directory:** `category`
- **Path:** `app/handelsbanken/category/chart`
- **Summary:** Chart components for visualizing Handelsbanken transaction categories.

### `app/inter`

- **Parent Directory:** `app`
- **Path:** `app/inter`
- **Summary:** This directory is likely for features related to Inter bank accounts.

### `app/inter-account`

- **Parent Directory:** `app`
- **Path:** `app/inter-account`
- **Summary:** This directory likely contains features for managing Inter bank accounts.

### `app/inter-account/category`

- **Parent Directory:** `inter-account`
- **Path:** `app/inter-account/category`
- **Summary:** Manages transaction categories for Inter bank accounts.

### `app/inter-account/category/chart`

- **Parent Directory:** `category`
- **Path:** `app/inter-account/category/chart`
- **Summary:** Chart components for visualizing Inter bank account transaction categories.

### `app/inter-account/info`

- **Parent Directory:** `inter-account`
- **Path:** `app/inter-account/info`
- **Summary:** Displays information about Inter bank accounts.

### `app/profile`

- **Parent Directory:** `app`
- **Path:** `app/profile`
- **Summary:** This directory contains the user profile page, where users can view and edit their information.

### `app/recurrent`

- **Parent Directory:** `app`
- **Path:** `app/recurrent`
- **Summary:** This directory is likely for managing recurrent transactions, such as subscriptions or recurring bills.

### `app/sjprio`

- **Parent Directory:** `app`
- **Path:** `app/sjprio`
- **Summary:** This directory is dedicated to features for SJPrio accounts.

### `app/types`

- **Parent Directory:** `app`
- **Path:** `app/types`
- **Summary:** Contains TypeScript type definitions used within the `app` directory.

### `app/unauthorized`

- **Parent Directory:** `app`
- **Path:** `app/unauthorized`
- **Summary:** This directory likely contains a page that is shown to users who are not authorized to access a certain resource.

### `app/upload`

- **Parent Directory:** `app`
- **Path:** `app/upload`
- **Summary:** This directory contains the UI and logic for uploading files, such as bank statements.

### `app/welcome`

- **Parent Directory:** `app`
- **Path:** `app/welcome`
- **Summary:** This directory likely contains a welcome page for new users.

---

## Directory Summary Table

| Directory         | Parent Directory | Path                               |
| :---------------- | :--------------- | :--------------------------------- |
| `about`           | `app`            | `app/about`                        |
| `actions`         | `app`            | `app/actions`                      |
| `amex`            | `app`            | `app/amex`                         |
| `chart`           | `amex`           | `app/amex/chart`                   |
| `auth`            | `app`            | `app/auth`                         |
| `callback`        | `auth`           | `app/auth/callback`                |
| `forgot-password` | `auth`           | `app/auth/forgot-password`         |
| `login`           | `auth`           | `app/auth/login`                   |
| `reset-password`  | `auth`           | `app/auth/reset-password`          |
| `signup`          | `auth`           | `app/auth/signup`                  |
| `components`      | `app`            | `app/components`                   |
| `email-client`    | `app`            | `app/email-client`                 |
| `email-merge`     | `app`            | `app/email-merge`                  |
| `family`          | `app`            | `app/family`                       |
| `global`          | `app`            | `app/global`                       |
| `chart`           | `global`         | `app/global/chart`                 |
| `handelsbanken`   | `app`            | `app/handelsbanken`                |
| `category`        | `handelsbanken`  | `app/handelsbanken/category`       |
| `chart`           | `category`       | `app/handelsbanken/category/chart` |
| `inter`           | `app`            | `app/inter`                        |
| `inter-account`   | `app`            | `app/inter-account`                |
| `category`        | `inter-account`  | `app/inter-account/category`       |
| `chart`           | `category`       | `app/inter-account/category/chart` |
| `info`            | `inter-account`  | `app/inter-account/info`           |
| `profile`         | `app`            | `app/profile`                      |
| `recurrent`       | `app`            | `app/recurrent`                    |
| `sjprio`          | `app`            | `app/sjprio`                       |
| `types`           | `app`            | `app/types`                        |
| `unauthorized`    | `app`            | `app/unauthorized`                 |
| `upload`          | `app`            | `app/upload`                       |
| `welcome`         | `app`            | `app/welcome`                      |
