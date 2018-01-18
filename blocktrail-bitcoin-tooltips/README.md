# Blocktrail Bitcoin Tooltips
A Google Chrome browser extension for loading and displaying live Bitcoin data for addresses on webpages, using the Blocktrail API.

###Installation
Available for download through the [Google web store.](https://chrome.google.com/webstore/detail/blocktrail-bitcoin-toolti/pffcjigdacpeaaoimonoienbhbkgcbmd).

###Manual Installation
Alternatively you can download source here and install it manually.  
To do this, first download this repoitory to a location on your computer. Then go to the extension setting in google Chrome: [chrome://extensions/](chrome://extensions/). Click the `Load unpacked extension...` button and select the folder containing the extension files (where the manifest.json file is located).  
The extension will now be enabled

### Features
#####1. Bitcoin Tooltips
after the webpage has loaded, the extension will scan the page for what appears to be links with Bitcoin addresses in them. Hovering over these links will then display a tooltip with the address' balance, total transactions, and category/tag information.

#####2. Context Menu - Search
Right clicking on a link with a Bitcoin address in it, or on a text selection of a Bitcoin address will present you with a context menu providing a couple of options:
  - ***Send Bitcoin***: This will show a popup window with a QR code for the address so you can easily scan and send bitcoins from a wallet on your smartphone/tablet.
  - ***Find on Bitcoin***: This will open the address on [blocktrail.com](https://www.blocktrail.com) in a new tab so you can get more indepth information, view transactions and see live updates from the network involving this address.

#####3. Page Summary
Click on the extension icon (the red "B" in top bar) and you will see a summary of how many links with bitcoin address have been found on the current page (duplicates are counted twice).  

###Known Issues
  - facebook causes some issues, due to the way it modifies links in the DOM after the page loads and truncates addresses in the link anchor. A current workaround has been implemented that results in the correct address being detected upon the second "hover" of the link
  - address detection is currently done through regex...this is not a flawless method and needs to be refined. 
  - No actual "verification" of a valid address is done. This is planed to be implemented so that false positives don't trigger the tooltip or context menu options.
