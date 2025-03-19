// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2024 John Maloney, Bernat Romagosa, and Jens Mönig

defineClass MicroBlocksConnectWidget morph editor indicatorM connectionName dropDownArrowM isConnected lastStatus

to newMicroBlocksConnectWidget aMicroBlocksEditor {
	return (initialize (new 'MicroBlocksConnectWidget') aMicroBlocksEditor)
}

method initialize MicroBlocksConnectWidget aMicroBlocksEditor {
	scale = (global 'scale')

	morph = (newMorph this)
	setHandler morph this
	setGrabRule morph 'defer'
	setTransparentTouch morph true
	setFPS morph 5
	editor = aMicroBlocksEditor
	isConnected = false

	indicatorM = (newMorph)
	addPart morph indicatorM

	connectionName = (newText (localized 'Connect') 'Arial' (14 * (global 'scale')) (microBlocksColor 'blueGray' 200))
	addPart morph (morph connectionName)

	dropDownArrowM = (newMorph)
	addPart morph dropDownArrowM

	setHighlight this false
	fixLayout this
	return this
}

// highlighting

method setHighlight MicroBlocksConnectWidget isOn {
	highlightColor = (microBlocksColor 'yellow')
	if isOn {
		setColor connectionName highlightColor
		setCostume dropDownArrowM (readSVGIcon 'dropdown-arrow' highlightColor)
	} else {
		setColor connectionName (microBlocksColor 'blueGray' 200)
		setCostume dropDownArrowM (readSVGIcon 'dropdown-arrow' (microBlocksColor 'blueGray' 200))
	}

	// change indicator highlight only if not connected
	if (not isConnected) {
		if isOn {
			setCostume indicatorM (readSVGIcon 'icon-usb2')
		} else {
			setCostume indicatorM (readSVGIcon 'icon-usb')
		}
	}
}

// layout

method fixLayout MicroBlocksConnectWidget {
	scale = (global 'scale')
	centerY = (24 * scale)
	space = (6 * scale)

	top = (top (morph this))
	x = ((left morph) + space)

	m = indicatorM
	setPosition m x (centerY - ((height m) / 2))
	x += ((width m) + space)

	m = (morph connectionName)
	setPosition m x (centerY - ((height m) / 2))
	x += ((width m) + space)

	m = dropDownArrowM
	setPosition m x (centerY - ((height m) / 2))
	x += ((width m) + space)

	setExtent morph (x - (left morph)) (topBarHeight editor)
}

// stepping

method step MicroBlocksConnectWidget {
	updateIndicator this
}

method updateIndicator MicroBlocksConnectWidget forcefully {
	if (busy (smallRuntime)) { return } // do nothing during file transfer

	status = (updateConnection (smallRuntime))
	if (and (lastStatus == status) (forcefully != true)) { return } // no change
	isConnected = ('connected' == status)

	if isConnected {
		setCostume indicatorM (readSVGIcon 'icon-usb3')
		updateConnectionName this (checkBoardType (smallRuntime scripter))
	} else {
		setCostume indicatorM (readSVGIcon 'icon-usb')
		updateConnectionName this (localized 'Connect')
	}
	lastStatus = status
}

method updateConnectionName MicroBlocksConnectWidget aString {
	if (isNil aString) { aString = '' }
	setText connectionName aString
	fixLayout this
	if (notNil editor) { fixTopBarLayout editor }
}

// connect to board

method connectToBoard MicroBlocksConnectWidget { selectPort (smallRuntime) }

// events

method handEnter MicroBlocksConnectWidget aHand {
	// to do: update highlighting
	setHighlight this true
	setCursor 'pointer'
}

method handLeave MicroBlocksConnectWidget aHand {
	// to do: update highlighting
	setHighlight this false
	setCursor 'default'
}

method handDownOn MicroBlocksConnectWidget aHand {
	setCursor 'pointer'
	return true
}

method handUpOn MicroBlocksConnectWidget aHand {
	if (containsPoint (bounds morph) (x aHand) (y aHand)) {
		connectToBoard this
	}
	return true
}
