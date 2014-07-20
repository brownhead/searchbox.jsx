# Ideas

* We'll want to have a large set of supported events (and be easy to hack in an additional event if needed). I think we can achieve this with mixins that the user's actual result items implement. Or even better a base class that is used by default if no component is provided in the configuration.
* When a component mounts we can have it register callbacks with the controller. When it unmounts it can unregister.

* it might be worth it to get rid eof the dropdown class. it just seems to get in the way of accessing the user's datasets.

# Components

* Highlighting will touch everything

## Input component

* Faded text (+ tab complete). User's dataset component triggers the text.
* (low priority) RTL support

## Search component

* Handles positioning the dropdown.

## Dropdown component

.. * Handles rendering the user components.
* (low priority) Scrollable list

## User's dataset component

* Make it as convenient as possible with mixins(?) or...
