/**
 * Shared integration data consumed by:
 *  - UtilitiesHubView (the Integrations page)
 *  - IntegrationPickerScreen (the scenario connect flow)
 */

export const DOMAIN_MAP: Record<string, string> = {
  // US SIS
  'PowerSchool': 'powerschool.com', 'Infinite Campus': 'infinitecampus.com', 'Skyward': 'skyward.com',
  'FACTS SIS': 'factsmgt.com', 'Aeries SIS': 'aeries.com',
  // UK
  'Arbor': 'arbor-education.com', 'SIMS': 'ess-sims.co.uk', 'Veracross': 'veracross.com', 'iSAMS': 'isams.com',
  'Wonde': 'wonde.com',
  // German SIS (government)
  'ASV Bayern': 'asv.bayern.de', 'SVWS-NRW': 'svws.nrw.de', 'LUSD': 'lusd.hessen.de',
  'DaNiS': 'danis-hilfe.nibis.de', 'SaxSVS': 'saxsvs.de', 'SchILD-NRW': 'schild-online.de',
  // German timetable / school-OS
  'WebUntis': 'webuntis.com', 'EduPage': 'edupage.org', 'DaVinci': 'stueber.de',
  'IServ': 'iserv.de', 'Schulmanager Online': 'schulmanager-online.de',
  // German LMS / state platforms
  'LOGINEO NRW': 'logineo.nrw.de', 'ByCS': 'bycs.de', 'itslearning': 'itslearning.com',
  'Schulportal Hessen': 'schulportal.hessen.de', 'LernSax': 'lernsax.de',
  // LMS (international)
  'Canvas': 'instructure.com', 'Google Classroom': 'classroom.google.com', 'Moodle': 'moodle.org',
  'Schoology': 'schoology.com', 'Brightspace': 'd2l.com', 'Blackboard': 'blackboard.com',
  'MS Teams Edu': 'microsoft.com', 'EBA': 'eba.gov.tr', 'Seesaw': 'seesaw.me',
  // Other regional SIS
  'WebUnits': 'webunits.com', 'K12NET': 'k12net.com', 'Magister': 'magister.com',
  'SomToday': 'somtoday.nl', 'Librus': 'librus.pl', 'Sebit Vitamin': 'vitaminegitim.com',
  // German communications / parent apps
  'Sdui': 'sdui.de', 'SchoolFox': 'schoolfox.com', 'stashcat': 'stashcat.com',
  // International comms
  'ParentSquare': 'parentsquare.com', 'Remind': 'remind.com', 'Bloomz': 'bloomz.com',
  'ClassTag': 'classtag.com', 'TalkingPoints': 'talkingpts.org', 'Klassly': 'klassroom.co',
  'SchoolMessenger': 'schoolmessenger.com', 'ClassDojo': 'classdojo.com',
  // Email / newsletter
  'rapidmail': 'rapidmail.de', 'CleverReach': 'cleverreach.com', 'Brevo': 'brevo.com',
  // Productivity / Identity
  'Microsoft 365': 'microsoft.com', 'Google Workspace': 'workspace.google.com',
  'Okta': 'okta.com', 'Clever': 'clever.com', 'ClassLink': 'classlink.com',
  'Azure AD / Entra': 'microsoft.com', 'VIDIS': 'vidis.schule',
  // Cloud storage
  'Nextcloud': 'nextcloud.com',
  // Apple
  'Apple School Manager': 'school.apple.com',
  // Video conferencing
  'Zoom': 'zoom.us', 'Visavid': 'visavid.de', 'BigBlueButton': 'bigbluebutton.org', 'Jitsi': 'jitsi.org',
  // Web / CMS
  'WordPress': 'wordpress.org', 'Drupal': 'drupal.org',
  // Forms / e-sign
  'LimeSurvey': 'limesurvey.org', 'DocuSign': 'docusign.com',
  'Skribble': 'skribble.com', 'D-Trust sign-me': 'sign-me.de',
  // Compliance / CMP
  'Cookiebot': 'cookiebot.com', 'Usercentrics': 'usercentrics.com', 'Klaro': 'kiprotect.com',
  'eRecht24': 'e-recht24.de',
  // Analytics
  'Google Analytics': 'analytics.google.com', 'Matomo': 'matomo.org',
  'Power BI': 'powerbi.microsoft.com',
  // CRM / enrollment
  'HubSpot': 'hubspot.com', 'Pipedrive': 'pipedrive.com',
  // Cafeteria / payments
  'MensaMax': 'mensamax.de', 'finAPI': 'finapi.io',
  // Other
  'Google Search': 'google.com', 'Bing Search': 'bing.com', 'Zapier': 'zapier.com',
};

/** Tailwind color classes per category index (0-based, wraps). */
export const CATEGORY_COLORS = [
  { tag: 'bg-blue-100 text-blue-700 border-blue-200',     activeTag: 'bg-blue-600 text-white border-blue-600'    },
  { tag: 'bg-emerald-100 text-emerald-700 border-emerald-200', activeTag: 'bg-emerald-600 text-white border-emerald-600' },
  { tag: 'bg-purple-100 text-purple-700 border-purple-200', activeTag: 'bg-purple-600 text-white border-purple-600'  },
  { tag: 'bg-amber-100 text-amber-700 border-amber-200',   activeTag: 'bg-amber-500 text-white border-amber-500'   },
  { tag: 'bg-rose-100 text-rose-700 border-rose-200',      activeTag: 'bg-rose-600 text-white border-rose-600'     },
  { tag: 'bg-indigo-100 text-indigo-700 border-indigo-200', activeTag: 'bg-indigo-600 text-white border-indigo-600' },
];

/** Fallback icon colors (same order, for connector cards). */
export const FALLBACK_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700', 'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700', 'bg-fuchsia-100 text-fuchsia-700',
];

export interface CategoryDef {
  /** i18n key for the label. */
  labelKey: string;
  connectors: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    labelKey: 'utilities.category.studentInfo',
    connectors: [
      'ASV Bayern', 'SVWS-NRW', 'LUSD', 'DaNiS', 'SaxSVS', 'SchILD-NRW',
      'EduPage', 'DaVinci', 'Schulmanager Online',
      'LOGINEO NRW', 'ByCS', 'itslearning', 'Schulportal Hessen', 'LernSax',
      'Arbor', 'SIMS', 'Veracross', 'iSAMS',
      'Infinite Campus', 'Skyward', 'FACTS SIS', 'Aeries SIS',
      'WebUnits', 'K12NET', 'Magister', 'SomToday', 'Librus',
      'Canvas', 'Google Classroom', 'Moodle', 'Schoology', 'Brightspace', 'Blackboard',
      'MS Teams Edu', 'EBA', 'Sebit Vitamin', 'Seesaw',
    ],
  },
  {
    labelKey: 'utilities.category.communication',
    connectors: [
      'IServ', 'Sdui', 'SchoolFox', 'stashcat',
      'rapidmail', 'CleverReach', 'Brevo',
      'ParentSquare', 'Remind', 'Bloomz', 'ClassTag', 'TalkingPoints',
      'Klassly', 'SchoolMessenger',
    ],
  },
  {
    labelKey: 'utilities.category.productivity',
    connectors: [
      'Clever', 'ClassLink', 'Wonde', 'VIDIS', 'Okta', 'Azure AD / Entra',
      'Microsoft 365', 'Google Workspace', 'Apple School Manager', 'Nextcloud',
      'Zoom', 'Visavid', 'BigBlueButton', 'Jitsi',
      'WordPress', 'Drupal',
      'LimeSurvey', 'DocuSign', 'Skribble', 'D-Trust sign-me',
      'Cookiebot', 'Usercentrics', 'Klaro', 'eRecht24',
      'HubSpot', 'Pipedrive',
      'MensaMax', 'finAPI',
      'Power BI', 'Zapier', 'Google Search', 'Bing Search',
    ],
  },
];
