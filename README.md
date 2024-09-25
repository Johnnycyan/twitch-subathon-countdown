<h1 align="center">Improved Twitch Subathon Countdown</h1>
<p align="center">This is a Twitch Subathon Countdown originally by JayexDesigns.</p>
<p align="center">The CSS Code is updated by Johnnycyan. The JS Files are updated by Johnnycyan, leabdd, and danilotitato to add functionalities. The electron GUI configurator is made by Johnnycyan.</p>
<br/>

<h2>Description</h2>
<p>A subathon timer that increases when someone subscribes, donates money, donates bits or purchases streamloots chests.</p>
<p>Added is a Timer that gets saved (in localStorage) and can be reset.</p>
<p>When you open the index.html you get to chose between "Reset" or "Start".</p>
<br/>

<h2>Shortcuts</h2>
<p>`CTRL+ALT+P` - Pause the Timer</p>
<p>`CTRL+ALT+H` - Enable/disable Happy Hour</p>
<p>`CTRL+ALT+R` - Enable/disable Random Hour</p>
<p>`CTRL+ALT+1` - Manually add 1h to the timer</p>
<p>`CTRL+ALT+2` - Manually add 1m to the timer</p>
<p>`CTRL+ALT+3` - Manually add 1s to the timer</p>
<p>`CTRL+ALT+7` - Manually subtract 1h from the timer</p>
<p>`CTRL+ALT+8` - Manually subtract 1m from the timer</p>
<p>`CTRL+ALT+0` - Manually subtract 1s from the timer</p>
<p>Shortcuts can be changed in config.js or the GUI configurator.</p>
<br/>

<h2>Preview</h2>
<h3 align="center"><img width="90%" src="./preview.webp"></h3>
<br/>

<h2>Configure</h2>
<p>After cloning this repository you'll have to either manually edit the "config.js" file or on Windows double-click the "Run This to Configure.bat" file for a GUI editor.</p>
<p>The GUI editor includes tooltips for what each option does when you hover over them.</p>
<p>For manual editing I included a "config.js.example" file to show you what the variables you can change do.</p>

<h3>Twitch</h3>
<p>To get your Subs and Bits you just have to add your Channel Name.</p>

<h3>Streamlabs Token</h3>
<p>To get the token you'll have to go to the API settings tab of your <a href="https://streamlabs.com/dashboard#/settings/api-settings">Streamlabs dashboard</a> then click on API Tokens, copy your socket API token and finally paste the code on the "streamlabs_token" variable in the "config.js" file.</p>
<img src="./auth_streamlabs.png">

<h3>StreamElements Token</h3>
<p>To get the token you'll have to go to your <a href="https://streamelements.com/dashboard/account/channels">StreamElements channels dashboard</a>, then click on show secrets, copy the Overlay token and paste the code on the "streamelements_token" variable in the "config.js" file.</p>
<img src="./auth_streamelements.png">

<h3>Streamloots Token</h3>
<p>To get the token you'll have to go to your Streamloots creator dashboard, then to alerts & widgets, then go to alerts, then copy the last part of the alerts url and finally paste the code on the "streamloots_token" variable in the "config.js" file.</p>
<img src="./auth_streamloots.png">

<h3>Initial Time</h3>
<p>You can set the initial time of the timer by setting the hours, minutes and seconds to be added when the timer is created.</p>

<h3>Maximum Time</h3>
<p>You can set the maximum total time of the timer by setting the hours, minutes and seconds. The timer will never run for more time in total than this.</p>

<h3>Random Happy Hour</h3>
<p>If this is true, you can turn enable Happy or Random Hour with the Shortcut. If it is false, the feature is disabled and cant be enabled.</p>
<p>You have to set the Happy Hour time values manually.</p>
<p>Random Hour has a bell curve which can be edited in the config. It multiplies the normal time by a random amount for each sub.</p>
<p>If enabled randHappy it can randomly activate the Happy Hour. It will last for one hour, but can be turned off manually with the Shortkey.</p>
<p>In the Config you can set a specific Date and Time. At that a Happy Hour will happen. scheduleHappy needs to be turned on.</p>

<h3>Bulk</h3>
<p>This enables that multiple Subs get added to the timer at once.</p>
<p>For Example when a user gifts 10 Subs.</p>

<h3>Full control on what to use</h3>
<p>You can enable and disable if you want to add time for Subscriptions, Bits, Donations or Chests.</p>

<h3>Other Values</h3>
<p>Change the other values to set the amount of seconds that will be added for the subscriptions, donations... And the minimum donation amounts to trigger the countdown increase.</p>

<h3>Usage</h3>
<p>To add it to OBS you just have to drag the "index.html" file to the sources section or add a browser source that points to the "index.html" file.</p>

<h2>Known Problems</h2>
<p2>Only Streamelements Token in config.js does not add time for Subscriptions. Emulate with the Overlay Editor does work.</p>
