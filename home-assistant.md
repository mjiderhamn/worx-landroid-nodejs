# Home Assistant push notifications for Worx Landroid

Home Assistant support multiple ways of getting 
[push notifications](https://home-assistant.io/components/notify/) from your
Worx Landroid robotic mower to your phone, such as 
[Pushbullet](https://home-assistant.io/components/notify.pushbullet/),
[Pushover](https://home-assistant.io/components/notify.pushover/) and 
[Notify My Android](https://home-assistant.io/components/notify.nma/). 

It is also possible to use [Facebook Messenger](https://home-assistant.io/components/notify.facebook/), but it requires some more work to set up.

There is also a [Home Assistant app for iOS](https://home-assistant.io/docs/ecosystem/ios/).

## Configuration

First set up the integration between your Landroid mower and Home Assistant
using the instructions [here](README.md).

Next configure the notification service of choice - see 
[Home Assistant documentation](https://home-assistant.io/components/notify/).

Then it is time to configure what events should trigger the notifications.

Here is an example config
```yaml
automation:
  - alias: Landroid alarm
    trigger:
      platform: state
      entity_id: landroid.no_of_alarms
      from: '0'
      to: '1'
    action:
      - service: notify.notify
        data:
          message: 'Help me! {{ states.landroid.state.state }}'
```

Detailed Home Assistant documentation can be found [here](https://home-assistant.io/docs/automation/).
For advanced message templating, see [here](https://home-assistant.io/docs/configuration/templating/).