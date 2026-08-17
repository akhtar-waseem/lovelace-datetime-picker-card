# Date Time Picker Card

[![HACS][hacs-shield]][hacs-link]
[![Downloads][downloads-shield]][downloads-link]
[![GitHub Release][releases-shield]][releases-link]
[![CI][ci-shield]][ci-link]
[![Project Maintenance][maintenance-shield]][maintenance-link]
[![License][license-shield]][license-link]

## Overview

A modern modal-based Date & Time Picker Card for [Home Assistant](https://www.home-assistant.io/)'s [Lovelace UI](https://www.home-assistant.io/lovelace).

Works seamlessly with Home Assistant [Input Datetime](https://www.home-assistant.io/integrations/input_datetime/) entities, supporting date-only, time-only, and full date & time selections via an intuitive popup dialog.

## Installation

### HACS

Install using [HACS](https://hacs.xyz) and add the following to your config:

```yaml
resources:
  - url: /hacsfiles/lovelace-datetime-picker-card/datetime-picker-card.js
    type: module
```

### Manual

Download `datetime-picker-card.js` from the [latest release](https://github.com/akhtar-waseem/lovelace-datetime-picker-card/releases/latest) and place it in your `config/www` folder. Add the following to your config:

```yaml
resources:
  - url: /local/datetime-picker-card.js
    type: module
```

## Usage

### Visual Editor

DateTime Picker Card supports Lovelace's Visual Editor. Click the **+** button to add a card, search for **DateTime Picker Card**, and use the graphical interface to configure options under **Display & Formatting** and **Actions**.

- Demo of setting up the card: [UI Configuration](https://github.com/akhtar-waseem/lovelace-datetime-picker-card/blob/main/examples/date-time-card-configuration-in-visual-editor.gif)

## Configuration Examples

- Demo of selecting date and time: [Date/Time/DateTime Selection](https://github.com/akhtar-waseem/lovelace-datetime-picker-card/blob/main/examples/date-time-card-in-action.gif)

### Standard Setup

Opens a modal picker using default 24-hour mode and system language settings.

```yaml
type: custom:datetime-picker-card
entity: input_datetime.test_date_time
```

### Custom Display Settings

Configured for 12-Hour dial mode, a custom date format, relative timestamp, and a quick "Now" button in the modal picker dialog.

```yaml
type: custom:datetime-picker-card
entity: input_datetime.test_date_time
name: Reminder Time
icon: mdi:calendar-clock
hour_mode: "12"
date_format: "MMM D, YYYY"
show_relative: true
show_quick_now: true
```

### Custom Actions

Configured with custom double tap and hold actions.

```yaml
type: custom:datetime-picker-card
entity: input_datetime.test_date_time
double_tap_action:
  action: toggle
hold_action:
  action: more-info
```

### Date & Time with Custom Icon and Name and Hold action

```yaml
type: custom:datetime-picker-card
entity: input_datetime.test_date_time
name: Custom Name
icon: mdi:airplane-clock
hour_mode: '24'
date_format: MMMM D, YYYY
show_relative: true
show_quick_now: true
hold_action:
  action: more-info
double_tap_action:
  action: none
```

### Date Only with Double Tap and Hold Action

```yaml
type: custom:datetime-picker-card
entity: input_datetime.test_date_only
hour_mode: '12'
date_format: default
show_relative: true
show_quick_now: true
double_tap_action:
  action: perform-action
  perform_action: input_boolean.toggle
  target:
    entity_id: input_boolean.toggle_test
  data: {}
hold_action:
  action: more-info
```

### Time Only with No extra actions

```yaml
type: custom:datetime-picker-card
entity: input_datetime.test_time_only
name: Time Only
hour_mode: '24'
date_format: default
show_relative: true
show_quick_now: true
```

## Options

| Name | Type | Requirement | Description | Default |
| --- | --- | --- | --- | --- |
| `type` | string | **Required** | `custom:datetime-picker-card` | |
| `entity` | string | **Required** | Target `input_datetime` entity | |
| `name` | string | **Optional** | Custom card header title | Entity's `friendly_name` |
| `icon` | string | **Optional** | Custom MDI icon | Entity's `icon` |
| `hour_mode` | `12` or `24` | **Optional** | Select 12-Hour dial (AM/PM) or 24-Hour dial (00-23) | `'24'` |
| `date_format` | string | **Optional** | Date format (`default`, `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`, `MMM D, YYYY`, `D MMM YYYY`, `MMMM D, YYYY`, `dddd, MMM D`) | `'default'` |
| `show_relative` | boolean | **Optional** | Display relative time label (e.g., "in 3 days") | `true` |
| `show_quick_now` | boolean | **Optional** | Display a button inside the picker modal to quickly set current date/time | `false` |
| `double_tap_action` | object | **Optional** | Home Assistant action configuration for double tap | |
| `hold_action` | object | **Optional** | Home Assistant action configuration for press & hold | |

## Theming

This card automatically adapts to your active Home Assistant theme. To customize colors across your dashboard, add these CSS variables to your theme's YAML configuration file:

| Theme Variable | Default | Description |
| --- | --- | --- |
| `--primary-color` | `var(--primary-color)` | Accent color for active selections, hands, and buttons |
| `--card-background-color` | `var(--card-background-color)` | Card and modal dialog background |
| `--primary-text-color` | `var(--primary-text-color)` | Primary text inside the card and picker dial |
| `--secondary-text-color` | `var(--secondary-text-color)` | Secondary text and relative timestamps |

## Meta

**Waseem Akhtar**
- [![GitHub][github-icon]][github-icon] [akhtar-waseem][github-link]


[github-icon]: https://raw.githubusercontent.com/primer/octicons/main/icons/mark-github-16.svg
[hacs-shield]: https://img.shields.io/badge/HACS-Default-brightgreen.svg
[hacs-link]: https://github.com/hacs/integration
[downloads-shield]: https://img.shields.io/github/downloads/akhtar-waseem/lovelace-datetime-picker-card/latest/total?color=brightgreen&logo=github
[downloads-link]: https://github.com/akhtar-waseem/lovelace-datetime-picker-card/releases
[releases-shield]: https://img.shields.io/github/v/release/akhtar-waseem/lovelace-datetime-picker-card
[releases-link]: https://github.com/akhtar-waseem/lovelace-datetime-picker-card/releases
[ci-shield]: https://img.shields.io/github/actions/workflow/status/akhtar-waseem/lovelace-datetime-picker-card/ci.yml?branch=main&label=CI&logo=github
[ci-link]: https://github.com/akhtar-waseem/lovelace-datetime-picker-card/actions
[maintenance-shield]: https://img.shields.io/badge/maintained-yes-brightgreen.svg
[maintenance-link]: https://github.com/akhtar-waseem/lovelace-datetime-picker-card
[license-shield]: https://img.shields.io/github/license/akhtar-waseem/lovelace-datetime-picker-card
[license-link]: https://github.com/akhtar-waseem/lovelace-datetime-picker-card/blob/main/LICENSE
[github-link]: https://github.com/akhtar-waseem/
