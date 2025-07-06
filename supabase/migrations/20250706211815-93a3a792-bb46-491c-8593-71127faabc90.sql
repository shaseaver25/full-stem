-- Add Somali translations to Microsoft Word training lessons

-- Update Lesson 201 - Introduction to Microsoft Word & the Ribbon
UPDATE "Lessons" 
SET "Translated Content" = "Translated Content" || jsonb_build_object(
  'so', 'Microsoft Word waa barnaamij kaa caawiya inaad qorto dukumiintiyada sida waraaqaha iyo warbixinnada. Ribbon-ka waa biirka kor ku yaal oo leh dhammaan badhanka iyo qalabka. Wuxuu leeyahay tab-yo kala duwan sida Guriga, Gelinta, iyo Naqshadaynta. Tab kasta wuxuu leeyahay qalab kala duwan oo aad isticmaali karto. Tab-ka Guriga wuxuu leeyahay qalab lagu dhigo qoraalka dhuuban ama lagu beddelo midabada. Tab-ka Gelinta wuxuu kuu ogolaadaa inaad ku darto sawiro iyo shaxado. Ku celceli riixida tab kasta si aad u aragto qalab kasta oo halkaas yaal.'
)
WHERE "Lesson ID" = 201;

-- Update Lesson 202 - Formatting Professional Documents
UPDATE "Lessons" 
SET "Translated Content" = "Translated Content" || jsonb_build_object(
  'so', 'CV-ga waa warqad u sheegta dadka xirfadahaaga iyo khibradaada. Warqadda daboolka waa warqad aad la dirto CV-gaaga. Labaduba waa inay u eegaan si nadiif ah oo xirfadeed ah. Isticmaal isku fonta dukumiintigaaga oo dhan. Ka dhig magacaaga inuu ka weyn yahay oo dhuuban yahay xagga sare. Isticmaal qodobo si aad u tixiso xirfadahaaga. Ka tag meel bannaan si aydaan u eegin cunsuris badan. Dooro font fudud sida Arial ama Times New Roman. Hubi in wax kasta ay si qumman u safan yihiin.'
)
WHERE "Lesson ID" = 202;

-- Update Lesson 203 - Working with Tables and Images
UPDATE "Lessons" 
SET "Translated Content" = "Translated Content" || jsonb_build_object(
  'so', 'Shaxadaha waxay caawiyaan inay habaabiyaan macluumaadka saffo iyo tiirar sida jaanta. Si aad shaxad u samayso, tag tab-ka Gelinta oo riix Shaxada. Dooro inta saff iyo tiir aad rabto. Waxaad ku dari kartaa qoraal sanduuq kasta. Si aad sawiro u geliso, riix Gelinta ka dibna Sawirrada. Dooro sawir kombayutarkaaga ka. Waxaad ka dhigi kartaa sawirrada inay ka weyn yihiin ama ka yar yihiin adoo jiida geesaha. Waxaad sidoo kale u dhaqaaqi kartaa sawirrada dukumiintigaaga gudihiisa. Shaxadaha iyo sawirrada waxay ka dhigaan dukumiintiyaadaaga inay ka xiisaan oo si fiican u habaabsan yihiin.'
)
WHERE "Lesson ID" = 203;

-- Update Lesson 204 - Styles, Headings, and Accessibility
UPDATE "Lessons" 
SET "Translated Content" = "Translated Content" || jsonb_build_object(
  'so', 'Styles-yadu waa qaabab horay loo sameeyay oo ka dhiga qoraalkaaga inuu isku ekaado dukumiintigaaga oo dhan. Cinwaannadu waa tiitalo qaybaha kala duwan. Isticmaal Cinwaanka 1 tiitalooyinka waaweyn iyo Cinwaanka 2 tiitalooyinka ka yar. Tani waxay dadka caawisaa inay fahmaan dukumiintigaaga si fiican. Waxay sidoo kale caawisaa dadka isticmaala kombayuutarro gaar ah si ay dukumiintiyada ugu akhriyan. Si aad styles u isticmaasho, muuji qoraalkaaga oo riix style tab-ka Guriga. Tani waxay ka dhigtaa dukumiintigaaga inuu u ekaado mid xirfadeed ah oo dadka oo dhan ay si fudud u akhriyi karaan.'
)
WHERE "Lesson ID" = 204;

-- Update Lesson 205 - Collaboration Tools and Version History
UPDATE "Lessons" 
SET "Translated Content" = "Translated Content" || jsonb_build_object(
  'so', 'Marka aad la shaqaynayso dad kale dukumiintiyada, waxaad isticmaali kartaa qalab gaar ah si aad wada u shaqaysaan. Faalloooyinku waxay kuu ogolaadaan inaad u dhaafto xusuusyo dad kale adigoo aan wax ka beddelin dukumiintiga. Raadraaca Isbeddelka waxay muujisaa dhammaan isbeddelada dadku sameeyaan midabo kala duwan. Waxaad aqbali kartaa ama diiday kartaa isbeddello. Taariikhda Nuqulka waxay muujisaa nuqulo duq ah oo dukumiintigaaga si aad u aragto waxa isbeddelay. Si aad faallo u darto, muuji qoraalka oo riix Faallo Cusub. Si aad u shido Raadraaca Isbeddelka, riix tab-ka Dib-u-eegista oo riix Raadraaca Isbeddelka.'
)
WHERE "Lesson ID" = 205;

-- Update Lesson 206 - MOS Certification Practice Tasks
UPDATE "Lessons" 
SET "Translated Content" = "Translated Content" || jsonb_build_object(
  'so', 'Imtixaanka MOS-ka wuxuu hubiyaa inaad si fiican u taqaan sida loo isticmaalo Microsoft Word. Waxaad qaban doontaa hawlo sida sameynta dukumiintiyada, ku darista shaxado, iyo hagaajinta qaabbaynta. Ku celceli xirfadahan: Samee dukumiinti cusub oo ku kaydi magac sax ah. Ku dar madax magacaaga iyo taariikhda. Samee shaxad leh 3 saff iyo 4 tiir. Ku dar sawir oo ka dhig mid ka yar. Isticmaal hab cinwaanno kala duwan. Hubi higgaadaada. Kuwani waa noocyada waxyaabaha aad arki karto imtixaanka.'
)
WHERE "Lesson ID" = 206;