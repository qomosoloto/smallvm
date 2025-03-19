// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2019 John Maloney, Bernat Romagosa, and Jens Mönig

// locale.gp
// Bernat Romagosa, January 2020
//
// Update missing strings in locale files

to startup {
	specs = (authoringSpecs)
	langName = (last (commandLine))
	setLanguage specs langName

	// Backup previous locale file before updating it
	oldLocale = (readFile (join '../translations/' langName '.po'))
	if (notNil oldLocale) {
		(writeFile (join (tmpPath) langName '.po') oldLocale)
	}

	updatedLocale = ''
	allLocales = (readFile '../translations/template.pot')

	// Check whether it's an RTL language, and keep the tag if so
	if ((localized 'RTL') == 'true') {
		updatedLocale = (join
			'msgid = "RTL"'
			(newline)
			'msgstr = "true"'
			(newline)
			(newline)
		)
	}

	lines = (toList (lines allLocales))
	while ((count lines) >= 1) {
		original = (removeFirst lines)
		if (or (beginsWith original '#') (original == '')) {
			// Copy comments. We should be smarter about it and get
			// them from the original file somehow.
			updatedLocale = (join updatedLocale original (newline))
		} (beginsWith original 'msgid') {
			original = (parseGetText specs original true)
			translation = (localizedOrNil original)
			if (isNil translation) {
				// Maybe this translation has now been prefixed?
				prefixIdx = (findFirst original ';')
				if (prefixIdx > 0) {
					translation = (localizedOrNil (substring original (prefixIdx + 1)))
				}
			}
			if (or (isNil translation) (isNil oldLocale)) {
				translation = ''
			}
			updatedLocale = (join
				updatedLocale
				'msgid "' (quoteEscaped original) '"'
				(newline)
				'msgstr "' (quoteEscaped translation) '"'
				(newline)
			)
		}
	}

	writeFile (join '../translations/' langName '.po') updatedLocale
}

to quoteEscaped aString {
	escaped = ''
	for i (count aString) {
		char = (at aString i)
		if (char == '"') { escaped = (join escaped '\') } //"make highlighter happy
		escaped = (join escaped char)
	}
	return escaped
}

to tmpPath {
	if (or ('Mac' == (platform)) ('Linux' == (platform))) {
		return '/tmp/'
	} else { // Windows
		return (join (userHomePath) '/AppData/Local/Temp/')
	}
}
