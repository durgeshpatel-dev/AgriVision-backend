// Data Translation Utility for Market Data
// Translates dynamic backend data (crops, states, districts, varieties) to Hindi

class DataTranslation {
  constructor() {
    // Crop name translations
    this.cropTranslations = {
      'Wheat': 'गेहूं',
      'Rice': 'चावल',
      'Maize': 'मक्का',
      'Cotton': 'कपास',
      'Sugarcane': 'गन्ना',
      'Onion': 'प्याज',
      'Potato': 'आलू',
      'Tomato': 'टमाटर',
      'Soybean': 'सोयाबीन',
      'Groundnut': 'मूंगफली',
      'Mustard': 'सरसों',
      'Bajra': 'बाजरा',
      'Jowar': 'ज्वार',
      'Arhar': 'अरहर',
      'Moong': 'मूंग',
      'Urad': 'उड़द',
      'Gram': 'चना',
      'Lentil': 'मसूर',
      'Sunflower': 'सूरजमुखी',
      'Castor': 'अरंडी',
      'Turmeric': 'हल्दी',
      'Coriander': 'धनिया',
      'Chilli': 'मिर्च',
      'Ginger': 'अदरक',
      'Garlic': 'लहसुन',
      // Adding missing crops from the image
      'Guar': 'ग्वार',
      'Bottle gourd': 'लौकी',
      'Lemon': 'नींबू',
      'Green Chilli': 'हरी मिर्च',
      'Paddy(Dhan)(Common)': 'धान (सामान्य)',
      'Paddy': 'धान',
      'Dhan': 'धान',
      // Adding fruits found in marketService.js
      'Pomegranate': 'अनार',
      'Banana': 'केला',
      'Lime': 'नींबू',
      // Adding grains from market controller
      'Barley': 'जौ',
      'Chana': 'चना',
      'Tur': 'तुर',
      'Masoor': 'मसूर',
      // Adding spices from market controller
      'Cumin': 'जीरा',
      'Cardamom': 'इलायची',
      'Black Pepper': 'काली मिर्च',
      'Cloves': 'लौंग',
      'Nutmeg': 'जायफल'
    };

    // State name translations
    this.stateTranslations = {
      'Andhra Pradesh': 'आंध्र प्रदेश',
      'Arunachal Pradesh': 'अरुणाचल प्रदेश',
      'Assam': 'असम',
      'Bihar': 'बिहार',
      'Chhattisgarh': 'छत्तीसगढ़',
      'Goa': 'गोवा',
      'Gujarat': 'गुजरात',
      'Haryana': 'हरियाणा',
      'Himachal Pradesh': 'हिमाचल प्रदेश',
      'Jharkhand': 'झारखंड',
      'Karnataka': 'कर्नाटक',
      'Kerala': 'केरल',
      'Madhya Pradesh': 'मध्य प्रदेश',
      'Maharashtra': 'महाराष्ट्र',
      'Manipur': 'मणिपुर',
      'Meghalaya': 'मेघालय',
      'Mizoram': 'मिज़ोरम',
      'Nagaland': 'नागालैंड',
      'Odisha': 'ओडिशा',
      'Punjab': 'पंजाब',
      'Rajasthan': 'राजस्थान',
      'Sikkim': 'सिक्किम',
      'Tamil Nadu': 'तमिल नाडु',
      'Telangana': 'तेलंगाना',
      'Tripura': 'त्रिपुरा',
      'Uttar Pradesh': 'उत्तर प्रदेश',
      'Uttarakhand': 'उत्तराखंड',
      'West Bengal': 'पश्चिम बंगाल',
      'Delhi': 'दिल्ली',
      'Jammu and Kashmir': 'जम्मू और कश्मीर',
      'Ladakh': 'लद्दाख',
      'Puducherry': 'पुडुचेरी',
      'Chandigarh': 'चंडीगढ़',
      'Dadra and Nagar Haveli': 'दादरा और नगर हवेली',
      'Daman and Diu': 'दमन और दीव',
      'Lakshadweep': 'लक्षद्वीप',
      'Andaman and Nicobar Islands': 'अंडमान और निकोबार द्वीप समूह'
    };

    // District translations (comprehensive for all states)
    this.districtTranslations = {
      // Maharashtra districts (complete)
      'Ahmednagar': 'अहमदनगर',
      'Akola': 'अकोला',
      'Amravati': 'अमरावती',
      'Aurangabad': 'औरंगाबाद',
      'Beed': 'बीड',
      'Bhandara': 'भंडारा',
      'Buldhana': 'बुलढाणा',
      'Chandrapur': 'चंद्रपुर',
      'Dhule': 'धुले',
      'Gadchiroli': 'गढ़चिरोली',
      'Gondia': 'गोंदिया',
      'Hingoli': 'हिंगोली',
      'Jalgaon': 'जलगांव',
      'Jalna': 'जालना',
      'Kolhapur': 'कोल्हापुर',
      'Latur': 'लातूर',
      'Mumbai City': 'मुंबई शहर',
      'Mumbai Suburban': 'मुंबई उपनगरीय',
      'Mumbai': 'मुंबई',
      'Nagpur': 'नागपुर',
      'Nanded': 'नांदेड',
      'Nandurbar': 'नंदुरबार',
      'Nashik': 'नासिक',
      'Osmanabad': 'उस्मानाबाद',
      'Palghar': 'पालघर',
      'Parbhani': 'परभणी',
      'Pune': 'पुणे',
      'Raigad': 'रायगड',
      'Ratnagiri': 'रत्नागिरी',
      'Sangli': 'सांगली',
      'Satara': 'सतारा',
      'Sindhudurg': 'सिंधुदुर्ग',
      'Solapur': 'सोलापुर',
      'Thane': 'ठाणे',
      'Wardha': 'वर्धा',
      'Washim': 'वाशिम',
      'Yavatmal': 'यवतमाल',

      // Punjab districts (complete)
      'Amritsar': 'अमृतसर',
      'Barnala': 'बरनाला',
      'Bathinda': 'बठिंडा',
      'Faridkot': 'फरीदकोट',
      'Fatehgarh Sahib': 'फतेहगढ़ साहिब',
      'Fazilka': 'फाजिल्का',
      'Ferozepur': 'फिरोजपुर',
      'Gurdaspur': 'गुरदासपुर',
      'Hoshiarpur': 'होशियारपुर',
      'Jalandhar': 'जालंधर',
      'Kapurthala': 'कपूरथला',
      'Ludhiana': 'लुधियाना',
      'Mansa': 'मानसा',
      'Moga': 'मोगा',
      'Muktsar': 'मुक्तसर',
      'Nawanshahr': 'नवांशहर',
      'Pathankot': 'पठानकोट',
      'Patiala': 'पटियाला',
      'Rupnagar': 'रूपनगर',
      'Sangrur': 'संगरूर',
      'Tarn Taran': 'तर्न तारन',

      // Uttar Pradesh districts (comprehensive list)
      'Lucknow': 'लखनऊ',
      'Kanpur': 'कानपुर',
      'Ghaziabad': 'गाजियाबाद',
      'Agra': 'आगरा',
      'Varanasi': 'वाराणसी',
      'Meerut': 'मेरठ',
      'Allahabad': 'इलाहाबाद',
      'Prayagraj': 'प्रयागराज',
      'Bareilly': 'बरेली',
      'Moradabad': 'मुरादाबाद',
      'Saharanpur': 'सहारनपुर',
      'Aligarh': 'अलीगढ़',
      'Amroha': 'अमरोहा',
      'Amethi': 'अमेठी',
      'Ambedkar Nagar': 'अंबेडकर नगर',
      'Amethi': 'अमेठी',
      'Amroha': 'अमरोहा',
      'Auraiya': 'औरैया',
      'Ayodhya': 'अयोध्या',
      'Azamgarh': 'आजमगढ़',
      'Baghpat': 'बागपत',
      'Bahraich': 'बहराइच',
      'Ballia': 'बलिया',
      'Balrampur': 'बलरामपुर',
      'Banda': 'बांदा',
      'Barabanki': 'बाराबंकी',
      'Basti': 'बस्ती',
      'Bhadohi': 'भदोही',
      'Bijnor': 'बिजनौर',
      'Budaun': 'बदायूं',
      'Bulandshahr': 'बुलंदशहर',
      'Chandauli': 'चंदौली',
      'Chitrakoot': 'चित्रकूट',
      'Deoria': 'देवरिया',
      'Etah': 'एटा',
      'Etawah': 'इटावा',
      'Farrukhabad': 'फर्रुखाबाद',
      'Fatehpur': 'फतेहपुर',
      'Firozabad': 'फिरोजाबाद',
      'Gautam Buddha Nagar': 'गौतम बुद्ध नगर',
      'Ghazipur': 'गाजीपुर',
      'Gonda': 'गोंडा',
      'Gorakhpur': 'गोरखपुर',
      'Hamirpur': 'हमीरपुर',
      'Hapur': 'हापुड़',
      'Hardoi': 'हरदोई',
      'Hathras': 'हाथरस',
      'Jalaun': 'जालौन',
      'Jaunpur': 'जौनपुर',
      'Jhansi': 'झांसी',
      'Kannauj': 'कन्नौज',
      'Kanpur Dehat': 'कानपुर देहात',
      'Kanpur Nagar': 'कानपुर नगर',
      'Kasganj': 'कासगंज',
      'Kaushambi': 'कौशाम्बी',
      'Kheri': 'खेरी',
      'Kushinagar': 'कुशीनगर',
      'Lalitpur': 'ललितपुर',
      'Maharajganj': 'महाराजगंज',
      'Mahoba': 'महोबा',
      'Mainpuri': 'मैनपुरी',
      'Mathura': 'मथुरा',
      'Mau': 'मऊ',
      'Mirzapur': 'मिर्जापुर',
      'Muzaffarnagar': 'मुजफ्फरनगर',
      'Pilibhit': 'पीलीभीत',
      'Pratapgarh': 'प्रतापगढ़',
      'Raebareli': 'रायबरेली',
      'Rampur': 'रामपुर',
      'Sambhal': 'संभल',
      'Sant Kabir Nagar': 'संत कबीर नगर',
      'Shahjahanpur': 'शाहजहांपुर',
      'Shamli': 'शामली',
      'Shrawasti': 'श्रावस्ती',
      'Siddharthnagar': 'सिद्धार्थनगर',
      'Sitapur': 'सीतापुर',
      'Sonbhadra': 'सोनभद्र',
      'Sultanpur': 'सुल्तानपुर',
      'Unnao': 'उन्नाव',

      // Gujarat districts (complete)
      'Ahmedabad': 'अहमदाबाद',
      'Amreli': 'अमरेली',
      'Anand': 'आनंद',
      'Aravalli': 'अरावली',
      'Banaskantha': 'बनासकांठा',
      'Bharuch': 'भरूच',
      'Bhavnagar': 'भावनगर',
      'Botad': 'बोटाद',
      'Chhota Udaipur': 'छोटा उदयपुर',
      'Dahod': 'दाहोद',
      'Dang': 'डांग',
      'Devbhoomi Dwarka': 'देवभूमि द्वारका',
      'Gandhinagar': 'गांधीनगर',
      'Gir Somnath': 'गिर सोमनाथ',
      'Jamnagar': 'जामनगर',
      'Junagadh': 'जूनागढ़',
      'Kheda': 'खेड़ा',
      'Kutch': 'कच्छ',
      'Mahisagar': 'महिसागर',
      'Mehsana': 'मेहसाणा',
      'Morbi': 'मोरबी',
      'Narmada': 'नर्मदा',
      'Navsari': 'नवसारी',
      'Panchmahal': 'पंचमहल',
      'Patan': 'पाटन',
      'Porbandar': 'पोरबंदर',
      'Rajkot': 'राजकोट',
      'Sabarkantha': 'साबरकांठा',
      'Surat': 'सूरत',
      'Surendranagar': 'सुरेंद्रनगर',
      'Tapi': 'तापी',
      'Vadodara': 'वडोदरा',
      'Valsad': 'वलसाड',
      // Additional Gujarat districts
      'Jambusar': 'जंबुसर',
      'Damnagar': 'दामनगर',

      // Punjab districts
      'Ludhiana': 'लुधियाना',
      'Amritsar': 'अमृतसर',
      'Jalandhar': 'जालंधर',
      'Patiala': 'पटियाला',
      'Bathinda': 'बठिंडा',
      'Mohali': 'मोहाली',
      'Ferozepur': 'फिरोजपुर',
      'Gurdaspur': 'गुरदासपुर',
      'Fatehgarh Sahib': 'फतेहगढ़ साहिब',
      'Faridkot': 'फरीदकोट',
      'Firozpur': 'फिरोजपुर',
      'Kapurthala': 'कपूरथला',
      'Mansa': 'मानसा',
      'Muktsar': 'मुक्तसर',
      'Nawanshahr': 'नवांशहर',
      'Rupnagar': 'रूपनगर',
      'Sangrur': 'संगरूर',
      'Tarn Taran': 'तर्न तारन',

      // Haryana districts (comprehensive list)
      'Faridabad': 'फरीदाबाद',
      'Gurgaon': 'गुरुग्राम',
      'Gurugram': 'गुरुग्राम',
      'Hisar': 'हिसार',
      'Panipat': 'पानीपत',
      'Karnal': 'करनाल',
      'Sonipat': 'सोनीपत',
      'Yamunanagar': 'यमुनानगर',
      'Rohtak': 'रोहतक',
      'Ambala': 'अंबाला',
      'Bhiwani': 'भिवानी',
      'Charkhi Dadri': 'चरखी दादरी',
      'Fatehabad': 'फतेहाबाद',
      'Jhajjar': 'झज्जर',
      'Jind': 'जींद',
      'Kaithal': 'कैथल',
      'Kurukshetra': 'कुरुक्षेत्र',
      'Mahendragarh': 'महेंद्रगढ़',
      'Nuh': 'नूंह',
      'Palwal': 'पलवल',
      'Panchkula': 'पंचकुला',
      'Rewari': 'रेवाड़ी',
      'Sirsa': 'सिरसा',

      // Rajasthan districts (complete)
      'Ajmer': 'अजमेर',
      'Alwar': 'अलवर',
      'Banswara': 'बांसवाड़ा',
      'Baran': 'बारां',
      'Barmer': 'बाड़मेर',
      'Bharatpur': 'भरतपुर',
      'Bhilwara': 'भीलवाड़ा',
      'Bikaner': 'बीकानेर',
      'Bundi': 'बूंदी',
      'Chittorgarh': 'चित्तौड़गढ़',
      'Churu': 'चुरू',
      'Dausa': 'दौसा',
      'Dholpur': 'धौलपुर',
      'Dungarpur': 'डूंगरपुर',
      'Hanumangarh': 'हनुमानगढ़',
      'Jaipur': 'जयपुर',
      'Jaisalmer': 'जैसलमेर',
      'Jalore': 'जालोर',
      'Jhalawar': 'झालावाड़',
      'Jhunjhunu': 'झुंझुनू',
      'Jodhpur': 'जोधपुर',
      'Karauli': 'करौली',
      'Kota': 'कोटा',
      'Nagaur': 'नागौर',
      'Pali': 'पाली',
      'Pratapgarh': 'प्रतापगढ़',
      'Rajsamand': 'राजसमंद',
      'Sawai Madhopur': 'सवाई माधोपुर',
      'Sikar': 'सीकर',
      'Sirohi': 'सिरोही',
      'Sri Ganganagar': 'श्री गंगानगर',
      'Tonk': 'टोंक',
      'Udaipur': 'उदयपुर',

      // Madhya Pradesh districts (complete)
      'Agar Malwa': 'आगर मालवा',
      'Alirajpur': 'अलीराजपुर',
      'Anuppur': 'अनूपपुर',
      'Ashoknagar': 'अशोकनगर',
      'Balaghat': 'बालाघाट',
      'Barwani': 'बड़वानी',
      'Betul': 'बैतूल',
      'Bhind': 'भिंड',
      'Bhopal': 'भोपाल',
      'Burhanpur': 'बुरहानपुर',
      'Chhatarpur': 'छतरपुर',
      'Chhindwara': 'छिंदवाड़ा',
      'Damoh': 'दमोह',
      'Datia': 'दतिया',
      'Dewas': 'देवास',
      'Dhar': 'धार',
      'Dindori': 'डिंडोरी',
      'Guna': 'गुना',
      'Gwalior': 'ग्वालियर',
      'Harda': 'हरदा',
      'Hoshangabad': 'होशंगाबाद',
      'Indore': 'इंदौर',
      'Jabalpur': 'जबलपुर',
      'Jhabua': 'झाबुआ',
      'Katni': 'कटनी',
      'Khandwa': 'खंडवा',
      'Khargone': 'खरगोन',
      'Mandla': 'मंडला',
      'Mandsaur': 'मंदसौर',
      'Morena': 'मुरैना',
      'Narsinghpur': 'नरसिंहपुर',
      'Neemuch': 'नीमच',
      'Niwari': 'निवाड़ी',
      'Panna': 'पन्ना',
      'Raisen': 'रायसेन',
      'Rajgarh': 'राजगढ़',
      'Ratlam': 'रतलाम',
      'Rewa': 'रीवा',
      'Sagar': 'सागर',
      'Satna': 'सतना',
      'Sehore': 'सीहोर',
      'Seoni': 'सिवनी',
      'Shahdol': 'शहडोल',
      'Shajapur': 'शाजापुर',
      'Sheopur': 'श्योपुर',
      'Shivpuri': 'शिवपुरी',
      'Sidhi': 'सीधी',
      'Singrauli': 'सिंगरौली',
      'Tikamgarh': 'टीकमगढ़',
      'Ujjain': 'उज्जैन',
      'Umaria': 'उमरिया',
      'Vidisha': 'विदिशा',

      // Karnataka districts (complete)
      'Bagalkot': 'बागलकोट',
      'Ballari': 'बल्लारी',
      'Belagavi': 'बेलगावी',
      'Bengaluru Rural': 'बेंगलुरु ग्रामीण',
      'Bengaluru Urban': 'बेंगलुरु शहरी',
      'Bangalore Rural': 'बैंगलोर ग्रामीण',
      'Bangalore Urban': 'बैंगलोर शहरी',
      'Belgaum': 'बेलगाम',
      'Bellary': 'बल्लारी',
      'Bidar': 'बीदर',
      'Chamarajanagar': 'चामराजनगर',
      'Chikkaballapur': 'चिक्कबल्लापुर',
      'Chikkamagaluru': 'चिक्कमगलूरु',
      'Chitradurga': 'चित्रदुर्ग',
      'Dakshina Kannada': 'दक्षिण कन्नड़',
      'Davanagere': 'दावणगेरे',
      'Dharwad': 'धारवाड़',
      'Gadag': 'गदग',
      'Gulbarga': 'गुलबर्गा',
      'Hassan': 'हासन',
      'Haveri': 'हावेरी',
      'Kodagu': 'कोडागु',
      'Kolar': 'कोलार',
      'Koppal': 'कोप्पल',
      'Mandya': 'मांड्या',
      'Mysore': 'मैसूर',
      'Raichur': 'रायचूर',
      'Ramanagara': 'रामनगर',
      'Shimoga': 'शिमोगा',
      'Tumkur': 'तुमकुर',
      'Udupi': 'उडुपी',
      'Uttara Kannada': 'उत्तर कन्नड़',
      'Vijayapura': 'विजयपुर',
      'Yadgir': 'यादगीर',

      // Tamil Nadu districts (complete - all 38 districts)
      'Ariyalur': 'अरियालुर',
      'Chengalpattu': 'चेंगलपट्टु',
      'Chennai': 'चेन्नई',
      'Coimbatore': 'कोयंबटूर',
      'Cuddalore': 'कडलोर',
      'Dharmapuri': 'धर्मपुरी',
      'Dindigul': 'डिंडीगुल',
      'Erode': 'इरोड',
      'Kallakurichi': 'कल्लकुरीची',
      'Kanchipuram': 'कांचीपुरम',
      'Kanyakumari': 'कन्याकुमारी',
      'Karur': 'करूर',
      'Krishnagiri': 'कृष्णगिरी',
      'Madurai': 'मदुरै',
      'Mayiladuthurai': 'मयिलादुथुरै',
      'Nagapattinam': 'नागपट्टिनम',
      'Namakkal': 'नामक्कल',
      'Nilgiris': 'नीलगिरी',
      'Perambalur': 'पेरम्बलुर',
      'Pudukkottai': 'पुडुकोट्टै',
      'Ramanathapuram': 'रामनाथपुरम',
      'Ranipet': 'रानीपेट',
      'Salem': 'सेलम',
      'Sivaganga': 'शिवगंगा',
      'Tenkasi': 'तेनकाशी',
      'Thanjavur': 'तंजावुर',
      'Theni': 'थेनी',
      'Thoothukudi': 'तूतुकुडी',
      'Tiruchirappalli': 'तिरुचिरापल्ली',
      'Tirunelveli': 'तिरुनेलवेली',
      'Tirupathur': 'तिरुपथुर',
      'Tiruppur': 'तिरुप्पूर',
      'Tiruvallur': 'तिरुवल्लुर',
      'Tiruvannamalai': 'तिरुवन्नामलै',
      'Tiruvarur': 'तिरुवरुर',
      'Vellore': 'वेल्लोर',
      'Viluppuram': 'विलुप्पुरम',
      'Virudhunagar': 'विरुधुनगर',

      // Andhra Pradesh districts (complete)
      'Anantapur': 'अनंतपुर',
      'Chittoor': 'चित्तूर',
      'East Godavari': 'पूर्व गोदावरी',
      'Guntur': 'गुंटूर',
      'Krishna': 'कृष्णा',
      'Kurnool': 'कुर्नूल',
      'Nellore': 'नेल्लूर',
      'Prakasam': 'प्रकाशम',
      'Srikakulam': 'श्रीकाकुलम',
      'Visakhapatnam': 'विशाखापट्टनम',
      'Vizianagaram': 'विजयनगरम',
      'West Godavari': 'पश्चिम गोदावरी',
      'Kadapa': 'कडपा',

      // Telangana districts (complete)
      'Adilabad': 'आदिलाबाद',
      'Bhadradri Kothagudem': 'भद्राद्री कोठागुडेम',
      'Hyderabad': 'हैदराबाद',
      'Jagtial': 'जगतियाल',
      'Jangaon': 'जंगांव',
      'Jayashankar Bhupalpally': 'जयशंकर भूपालपल्ली',
      'Jogulamba Gadwal': 'जोगुलाम्बा गडवाल',
      'Kamareddy': 'कामारेड्डी',
      'Karimnagar': 'करीमनगर',
      'Khammam': 'खम्मम',
      'Komaram Bheem Asifabad': 'कोमाराम भीम आसिफाबाद',
      'Mahabubabad': 'महबूबाबाद',
      'Mahabubnagar': 'महबूबनगर',
      'Mancherial': 'मंचेरियल',
      'Medak': 'मेडक',
      'Medchal Malkajgiri': 'मेडचल मलकाजगिरी',
      'Nagarkurnool': 'नगरकुर्नूल',
      'Nalgonda': 'नलगोंडा',
      'Nirmal': 'निर्मल',
      'Nizamabad': 'निजामाबाद',
      'Peddapalli': 'पेड्डापल्ली',
      'Rajanna Sircilla': 'राजन्ना सिरसिल्ला',
      'Rangareddy': 'रंगारेड्डी',
      'Sangareddy': 'संगारेड्डी',
      'Siddipet': 'सिद्दीपेट',
      'Suryapet': 'सूर्यापेट',
      'Vikarabad': 'विकाराबाद',
      'Wanaparthy': 'वानपर्थी',
      'Warangal Rural': 'वारंगल ग्रामीण',
      'Warangal Urban': 'वारंगल शहरी',
      'Yadadri Bhuvanagiri': 'यादाद्री भुवनगिरी',

      // Kerala districts (complete)
      'Alappuzha': 'अलप्पुझा',
      'Ernakulam': 'एर्णाकुलम',
      'Idukki': 'इडुक्की',
      'Kannur': 'कन्नूर',
      'Kasaragod': 'कासरगोड',
      'Kollam': 'कोल्लम',
      'Kottayam': 'कोट्टायम',
      'Kozhikode': 'कोझिकोड',
      'Malappuram': 'मलप्पुरम',
      'Palakkad': 'पलक्कड़',
      'Pathanamthitta': 'पथानमथिट्टा',
      'Thiruvananthapuram': 'तिरुवनंतपुरम',
      'Thrissur': 'त्रिस्सूर',
      'Wayanad': 'वायनाड',

      // Odisha districts (complete - all 30 districts)
      'Angul': 'अंगुल',
      'Balangir': 'बलांगीर',
      'Balasore': 'बालासोर',
      'Bargarh': 'बरगढ़',
      'Bhadrak': 'भद्रक',
      'Boudh': 'बौध',
      'Cuttack': 'कटक',
      'Deogarh': 'देवगढ़',
      'Dhenkanal': 'ढेंकानाल',
      'Gajapati': 'गजपति',
      'Ganjam': 'गंजम',
      'Jagatsinghpur': 'जगतसिंहपुर',
      'Jajpur': 'जाजपुर',
      'Jharsuguda': 'झारसुगुड़ा',
      'Kalahandi': 'कलाहांडी',
      'Kandhamal': 'कंधमाल',
      'Kendrapara': 'केंद्रपाड़ा',
      'Kendujhar': 'केंदुझर',
      'Keonjhar': 'केवझर',
      'Khurda': 'खुर्दा',
      'Koraput': 'कोरापुट',
      'Malkangiri': 'मलकानगिरी',
      'Mayurbhanj': 'मयूरभंज',
      'Nabarangpur': 'नबरंगपुर',
      'Nayagarh': 'नयागढ़',
      'Nuapada': 'नुआपाड़ा',
      'Puri': 'पुरी',
      'Rayagada': 'रायगड़ा',
      'Sambalpur': 'संबलपुर',
      'Sonepur': 'सोनपुर',
      'Sundargarh': 'सुंदरगढ़',

      // West Bengal districts (complete)
      'Alipurduar': 'अलीपुरद्वार',
      'Bankura': 'बांकुड़ा',
      'Birbhum': 'बीरभूम',
      'Cooch Behar': 'कूच बिहार',
      'Dakshin Dinajpur': 'दक्षिण दिनाजपुर',
      'Darjeeling': 'दार्जिलिंग',
      'Hooghly': 'हुगली',
      'Howrah': 'हावड़ा',
      'Jalpaiguri': 'जलपाईगुड़ी',
      'Jhargram': 'झारग्राम',
      'Kalimpong': 'कलिम्पोंग',
      'Kolkata': 'कोलकाता',
      'Malda': 'मालदा',
      'Murshidabad': 'मुर्शिदाबाद',
      'Nadia': 'नदिया',
      'North 24 Parganas': 'उत्तर 24 परगना',
      'Paschim Bardhaman': 'पश्चिम बर्धमान',
      'Paschim Medinipur': 'पश्चिम मेदिनीपुर',
      'Purba Bardhaman': 'पूर्व बर्धमान',
      'Purba Medinipur': 'पूर्व मेदिनीपुर',
      'Purulia': 'पुरुलिया',
      'South 24 Parganas': 'दक्षिण 24 परगना',
      'Uttar Dinajpur': 'उत्तर दिनाजपुर',

      // Bihar districts (complete)
      'Araria': 'अररिया',
      'Arwal': 'अरवल',
      'Aurangabad': 'औरंगाबाद',
      'Banka': 'बांका',
      'Begusarai': 'बेगूसराय',
      'Bhagalpur': 'भागलपुर',
      'Bhojpur': 'भोजपुर',
      'Buxar': 'बक्सर',
      'Darbhanga': 'दरभंगा',
      'East Champaran': 'पूर्वी चंपारण',
      'Gaya': 'गया',
      'Gopalganj': 'गोपालगंज',
      'Jamui': 'जमुई',
      'Jehanabad': 'जहानाबाद',
      'Kaimur': 'कैमूर',
      'Katihar': 'कटिहार',
      'Khagaria': 'खगड़िया',
      'Kishanganj': 'किशनगंज',
      'Lakhisarai': 'लखीसराय',
      'Madhepura': 'मधेपुरा',
      'Madhubani': 'मधुबनी',
      'Munger': 'मुंगेर',
      'Muzaffarpur': 'मुजफ्फरपुर',
      'Nalanda': 'नालंदा',
      'Nawada': 'नवादा',
      'Patna': 'पटना',
      'Purnia': 'पूर्णिया',
      'Rohtas': 'रोहतास',
      'Saharsa': 'सहरसा',
      'Samastipur': 'समस्तीपुर',
      'Saran': 'सारण',
      'Sheikhpura': 'शेखपुरा',
      'Sheohar': 'शिवहर',
      'Sitamarhi': 'सीतामढ़ी',
      'Siwan': 'सीवान',
      'Supaul': 'सुपौल',
      'Vaishali': 'वैशाली',
      'West Champaran': 'पश्चिमी चंपारण',

      // Jharkhand districts (complete)
      'Bokaro': 'बोकारो',
      'Chatra': 'चतरा',
      'Deoghar': 'देवघर',
      'Dhanbad': 'धनबाद',
      'Dumka': 'दुमका',
      'East Singhbhum': 'पूर्वी सिंहभूम',
      'Garhwa': 'गढ़वा',
      'Giridih': 'गिरिडीह',
      'Godda': 'गोड्डा',
      'Gumla': 'गुमला',
      'Hazaribagh': 'हजारीबाग',
      'Jamtara': 'जामतारा',
      'Khunti': 'खूंटी',
      'Koderma': 'कोडरमा',
      'Latehar': 'लातेहार',
      'Lohardaga': 'लोहरदगा',
      'Pakur': 'पाकुड़',
      'Palamu': 'पलामू',
      'Ramgarh': 'रामगढ़',
      'Ranchi': 'रांची',
      'Sahebganj': 'साहेबगंज',
      'Seraikela Kharsawan': 'सरायकेला खरसावां',
      'Simdega': 'सिमडेगा',
      'West Singhbhum': 'पश्चिमी सिंहभूम',

      // Chhattisgarh districts (complete - all 28 districts)
      'Balod': 'बालोद',
      'Baloda Bazar': 'बलौदा बाजार',
      'Balrampur': 'बलरामपुर',
      'Bastar': 'बस्तर',
      'Bemetara': 'बेमेतरा',
      'Bijapur': 'बीजापुर',
      'Bilaspur': 'बिलासपुर',
      'Dantewada': 'दंतेवाड़ा',
      'Dhamtari': 'धमतरी',
      'Durg': 'दुर्ग',
      'Gariaband': 'गरियाबंद',
      'Gaurela Pendra Marwahi': 'गौरेला पेंड्रा मरवाही',
      'Janjgir Champa': 'जांजगीर चांपा',
      'Jashpur': 'जशपुर',
      'Kabirdham': 'कबीरधाम',
      'Kanker': 'कांकेर',
      'Kondagaon': 'कोंडागांव',
      'Korba': 'कोरबा',
      'Korea': 'कोरिया',
      'Mahasamund': 'महासमुंद',
      'Mungeli': 'मुंगेली',
      'Narayanpur': 'नारायणपुर',
      'Raigarh': 'रायगढ़',
      'Raipur': 'रायपुर',
      'Rajnandgaon': 'राजनांदगांव',
      'Sukma': 'सुकमा',
      'Surajpur': 'सूरजपुर',
      'Surguja': 'सरगुजा',

      // Assam districts (complete - all 33 districts)
      'Baksa': 'बक्सा',
      'Barpeta': 'बारपेटा',
      'Biswanath': 'बिस्वनाथ',
      'Bongaigaon': 'बोंगाईगांव',
      'Cachar': 'कछार',
      'Charaideo': 'चराईदेव',
      'Chirang': 'चिरांग',
      'Darrang': 'दर्रांग',
      'Dhemaji': 'धेमाजी',
      'Dhubri': 'धुबरी',
      'Dibrugarh': 'डिब्रूगढ़',
      'Goalpara': 'गोवालपारा',
      'Golaghat': 'गोलाघाट',
      'Hailakandi': 'हैलाकांदी',
      'Hojai': 'होजाई',
      'Jorhat': 'जोरहाट',
      'Kamrup': 'कामरूप',
      'Kamrup Metropolitan': 'कामरूप महानगर',
      'Karbi Anglong': 'कार्बी आंगलोंग',
      'Karimganj': 'करीमगंज',
      'Kokrajhar': 'कोकराझार',
      'Lakhimpur': 'लखीमपुर',
      'Majuli': 'माजुली',
      'Morigaon': 'मोरीगांव',
      'Nagaon': 'नगांव',
      'Nalbari': 'नलबाड़ी',
      'Dima Hasao': 'दीमा हसाओ',
      'Sivasagar': 'शिवसागर',
      'Sonitpur': 'सोणितपुर',
      'South Salmara Mankachar': 'दक्षिण सलमारा मानकाचार',
      'South Salmara-Mankachar': 'दक्षिण सलमारा मानकाचार',
      'South-Salmara-Mankachra': 'दक्षिण सलमारा मानकाचार',
      'Tamulpur': 'तमुलपुर',
      'Tinsukia': 'तिनसुकिया',
      'Udalguri': 'उदालगुरी',
      'West Karbi Anglong': 'पश्चिम कार्बी आंगलोंग',

      // Himachal Pradesh districts (complete)
      'Bilaspur': 'बिलासपुर',
      'Chamba': 'चंबा',
      'Hamirpur': 'हमीरपुर',
      'Kangra': 'कांगड़ा',
      'Kinnaur': 'किन्नौर',
      'Kullu': 'कुल्लू',
      'Lahaul and Spiti': 'लाहौल और स्पीति',
      'Mandi': 'मंडी',
      'Shimla': 'शिमला',
      'Sirmaur': 'सिरमौर',
      'Solan': 'सोलन',
      'Una': 'ऊना',

      // Uttarakhand districts (complete)
      'Almora': 'अल्मोड़ा',
      'Bageshwar': 'बागेश्वर',
      'Chamoli': 'चमोली',
      'Champawat': 'चंपावत',
      'Dehradun': 'देहरादून',
      'Haridwar': 'हरिद्वार',
      'Nainital': 'नैनीताल',
      'Pauri Garhwal': 'पौड़ी गढ़वाल',
      'Pithoragarh': 'पिथौरागढ़',
      'Rudraprayag': 'रुद्रप्रयाग',
      'Tehri Garhwal': 'टिहरी गढ़वाल',
      'Udham Singh Nagar': 'उधम सिंह नगर',
      'Uttarkashi': 'उत्तरकाशी',

      // Goa districts
      'North Goa': 'उत्तर गोवा',
      'South Goa': 'दक्षिण गोवा',

      // Manipur districts
      'Bishnupur': 'बिष्णुपुर',
      'Chandel': 'चांदेल',
      'Churachandpur': 'चुराचांदपुर',
      'Imphal East': 'इंफाल पूर्व',
      'Imphal West': 'इंफाल पश्चिम',
      'Jiribam': 'जिरीबाम',
      'Kakching': 'काकचिंग',
      'Kamjong': 'कामजोंग',
      'Kangpokpi': 'कांगपोकपी',
      'Noney': 'नोनी',
      'Pherzawl': 'फेरजावल',
      'Senapati': 'सेनापति',
      'Tamenglong': 'तामेंगलोंग',
      'Tengnoupal': 'तेंगनौपाल',
      'Thoubal': 'थौबल',
      'Ukhrul': 'उखरूल',

      // Meghalaya districts
      'East Garo Hills': 'पूर्व गारो हिल्स',
      'East Jaintia Hills': 'पूर्व जयंतिया हिल्स',
      'East Khasi Hills': 'पूर्व खासी हिल्स',
      'North Garo Hills': 'उत्तर गारो हिल्स',
      'Ri Bhoi': 'री भोई',
      'South Garo Hills': 'दक्षिण गारो हिल्स',
      'South West Garo Hills': 'दक्षिण पश्चिम गारो हिल्स',
      'South West Khasi Hills': 'दक्षिण पश्चिम खासी हिल्स',
      'West Garo Hills': 'पश्चिम गारो हिल्स',
      'West Jaintia Hills': 'पश्चिम जयंतिया हिल्स',
      'West Khasi Hills': 'पश्चिम खासी हिल्स',

      // Mizoram districts (complete - all 11 districts)
      'Aizawl': 'आइजोल',
      'Champhai': 'चम्फाई',
      'Hnahthial': 'नह्नथियाल',
      'Khawzawl': 'खावजावल',
      'Kolasib': 'कोलासिब',
      'Lawngtlai': 'लांगतलाई',
      'Lunglei': 'लुंगलेई',
      'Mamit': 'मामित',
      'Saiha': 'साइहा',
      'Saitual': 'साइतुआल',
      'Serchhip': 'सेरछिप',

      // Nagaland districts (complete - all 12 districts)
      'Dimapur': 'दीमापुर',
      'Kiphire': 'किफीरे',
      'Kohima': 'कोहिमा',
      'Longleng': 'लोंगलेंग',
      'Mokokchung': 'मोकोकचुंग',
      'Mon': 'मोन',
      'Noklak': 'नोक्लाक',
      'Peren': 'पेरेन',
      'Phek': 'फेक',
      'Tuensang': 'तुएनसांग',
      'Wokha': 'वोखा',
      'Zunheboto': 'जुन्हेबोटो',

      // Tripura districts
      'Dhalai': 'धलाई',
      'Gomati': 'गोमती',
      'Khowai': 'खोवाई',
      'North Tripura': 'उत्तर त्रिपुरा',
      'Sepahijala': 'सेपाहीजाला',
      'South Tripura': 'दक्षिण त्रिपुरा',
      'Unakoti': 'उनाकोटि',
      'West Tripura': 'पश्चिम त्रिपुरा',

      // Arunachal Pradesh districts
      'Anjaw': 'अंजव',
      'Changlang': 'चांगलांग',
      'Dibang Valley': 'दिबांग घाटी',
      'East Kameng': 'पूर्व कामेंग',
      'East Siang': 'पूर्व सियांग',
      'Itanagar': 'ईटानगर',
      'Kamle': 'कामले',
      'Kra Daadi': 'क्रा दादी',
      'Kurung Kumey': 'कुरुंग कुमे',
      'Lepa Rada': 'लेपा राडा',
      'Lohit': 'लोहित',
      'Longding': 'लोंगडिंग',
      'Lower Dibang Valley': 'लोअर दिबांग घाटी',
      'Lower Siang': 'लोअर सियांग',
      'Lower Subansiri': 'लोअर सुबनसिरी',
      'Namsai': 'नामसाई',
      'Pakke Kessang': 'पक्के केसांग',
      'Papum Pare': 'पापुम पारे',
      'Shi Yomi': 'शी योमी',
      'Siang': 'सियांग',
      'Tawang': 'तवांग',
      'Tirap': 'तिरप',
      'Upper Siang': 'अपर सियांग',
      'Upper Subansiri': 'अपर सुबनसिरी',
      'West Kameng': 'पश्चिम कामेंग',
      'West Siang': 'पश्चिम सियांग',

      // Sikkim districts
      'East Sikkim': 'पूर्व सिक्किम',
      'North Sikkim': 'उत्तर सिक्किम',
      'South Sikkim': 'दक्षिण सिक्किम',
      'West Sikkim': 'पश्चिम सिक्किम',

      // Union Territories
      'New Delhi': 'नई दिल्ली',
      'Central Delhi': 'मध्य दिल्ली',
      'East Delhi': 'पूर्वी दिल्ली',
      'North Delhi': 'उत्तरी दिल्ली',
      'North East Delhi': 'उत्तर पूर्वी दिल्ली',
      'North West Delhi': 'उत्तर पश्चिमी दिल्ली',
      'Shahdara': 'शाहदरा',
      'South Delhi': 'दक्षिण दिल्ली',
      'South East Delhi': 'दक्षिण पूर्वी दिल्ली',
      'South West Delhi': 'दक्षिण पश्चिमी दिल्ली',
      'West Delhi': 'पश्चिमी दिल्ली',

      // Jammu and Kashmir districts
      'Anantnag': 'अनंतनाग',
      'Bandipora': 'बांदीपोरा',
      'Baramulla': 'बारामुला',
      'Budgam': 'बडगाम',
      'Doda': 'डोडा',
      'Ganderbal': 'गांदरबल',
      'Jammu': 'जम्मू',
      'Kathua': 'कठुआ',
      'Kishtwar': 'किश्तवाड़',
      'Kulgam': 'कुलगाम',
      'Kupwara': 'कुपवाड़ा',
      'Poonch': 'पुंछ',
      'Pulwama': 'पुलवामा',
      'Rajouri': 'राजौरी',
      'Ramban': 'रामबन',
      'Reasi': 'रियासी',
      'Samba': 'सांबा',
      'Shopian': 'शोपियां',
      'Srinagar': 'श्रीनगर',
      'Udhampur': 'उधमपुर',

      // Ladakh districts
      'Kargil': 'कारगिल',
      'Leh': 'लेह',

      // Andaman and Nicobar Islands districts
      'Nicobar': 'निकोबार',
      'North and Middle Andaman': 'उत्तर और मध्य अंडमान',
      'South Andaman': 'दक्षिण अंडमान',

      // Additional districts
      'Hubli': 'हुबली',
      'Mangalore': 'मंगलूर',
      'Kochi': 'कोच्चि',
      'Bhubaneswar': 'भुवनेश्वर',
      'Durgapur': 'दुर्गापुर',
      'Jamshedpur': 'जमशेदपुर',
      'Guwahati': 'गुवाहाटी',
      'Silchar': 'सिलचर',
      'Roorkee': 'रुड़की',

      // Additional major cities that might appear
      'Noida': 'नोएडा',
      'Ghaziabad': 'गाजियाबाद',
      'Greater Noida': 'ग्रेटर नोएडा',
      'Faridabad': 'फरीदाबाद',
      'Gurgaon': 'गुरुग्राम',
      'Chandigarh': 'चंडीगढ़',
    };

    // Crop variety translations (enhanced with more varieties)
    this.varietyTranslations = {
      // Wheat varieties
      'HD-2967': 'एचडी-२९६७',
      'PBW-343': 'पीबीडब्ल्यू-३४३',
      'WH-147': 'डब्ल्यूएच-१४७',
      'WH-1105': 'डब्ल्यूएच-११०५',
      'DBW-88': 'डीबीडब्ल्यू-८८',
      'HD-3086': 'एचडी-३०८६',
      'GW-322': 'जीडब्ल्यू-३२२',
      'Lokwan': 'लोकवन',
      'Sharbati': 'शरबती',
      'Bansi': 'बांसी',
      'Kalyan Sona': 'कल्याण सोना',
      'UP-2338': 'यूपी-२३३८',
      'HD-2932': 'एचडी-२९३२',
      'DBW-17': 'डीबीडब्ल्यू-१७',
      'WH-542': 'डब्ल्यूएच-५४२',
      'HD-2733': 'एचडी-२७३३',
      'PBW-550': 'पीबीडब्ल्यू-५५०',

      // Rice varieties
      'Basmati-370': 'बासमती-370',
      'Pusa-44': 'पूसा-44',
      'IR-64': 'आईआर-64',
      'Swarna': 'स्वर्णा',
      'Sona Masuri': 'सोना मसूरी',
      'MTU-7029': 'एमटीयू-7029',
      'BPT-5204': 'बीपीटी-5204',

      // Cotton varieties
      'Bt-Cotton': 'बीटी कॉटन',
      'DCH-32': 'डीसीएच-32',
      'Bunny': 'बनी',
      'RCH-2': 'आरसीएच-2',

      // Quality grades
      'FAQ': 'एफएक्यू',
      'Good': 'अच्छा',
      'Average': 'औसत',
      'Below Average': 'औसत से कम',
      'Superior': 'उत्कृष्ट',
      'Premium': 'प्रीमियम',
      'Grade-A': 'ग्रेड-ए',
      'Grade-B': 'ग्रेड-बी'
    };

    // Market/APMC translations
    this.marketTermTranslations = {
      'APMC': 'एपीएमसी',
      'Market': 'बाजार',
      'Mandi': 'मंडी',
      'Agricultural Market': 'कृषि बाजार',
      'Wholesale Market': 'थोक बाजार',
      'Regulated Market': 'नियंत्रित बाजार',
      // Specific market/town names
      'Tiruvuru': 'तिरुवुरु',
      'Jambusar': 'जंबुसर',
      'Damnagar': 'दामनगर',
      // Adding missing market names from image analysis
      'Chandigarh': 'चंडीगढ़',
      'Atmakur': 'आत्माकुर',
      'Babra': 'बाबरा',
      // Market type suffixes
      'Grain/Fruit': 'अनाज/फल',
      'SPS': 'एसपीएस',
      'Grain': 'अनाज',
      'Fruit': 'फल'
    };

    // Demand level translations
    this.demandTranslations = {
      'High': 'उच्च',
      'Medium': 'मध्यम',
      'Low': 'कम',
      'Very High': 'बहुत उच्च',
      'Moderate': 'मध्यम',
      'Steady': 'स्थिर',
      'Increasing': 'बढ़ती',
      'Decreasing': 'घटती'
    };

    // Quality translations
    this.qualityTranslations = {
      'Excellent': 'उत्कृष्ट',
      'Good': 'अच्छा',
      'Fair': 'ठीक',
      'Poor': 'खराब',
      'Premium': 'प्रीमियम',
      'Standard': 'मानक',
      'Below Standard': 'मानक से कम'
    };
  }

  // Main translation function
  translateMarketData(data, language = 'en') {
    if (language === 'en' || !data) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.translateSingleRecord(item, language));
    } else {
      return this.translateSingleRecord(data, language);
    }
  }

  // Translate a single market record
  translateSingleRecord(record, language) {
    if (language !== 'hi') {
      return record;
    }

    const translated = { ...record };

    // Translate crop name
    if (translated.crop) {
      translated.crop = this.cropTranslations[translated.crop] || translated.crop;
    }

    // Translate state name
    if (translated.state) {
      translated.state = this.stateTranslations[translated.state] || translated.state;
    }

    // Translate district name
    if (translated.district) {
      translated.district = this.districtTranslations[translated.district] || translated.district;
    }

    // Translate variety
    if (translated.variety) {
      translated.variety = this.varietyTranslations[translated.variety] || translated.variety;
    }

    // Translate market name
    if (translated.market) {
      // Handle APMC markets
      if (translated.market.includes('APMC')) {
        const districtName = translated.market.replace(' APMC', '');
        const translatedDistrict = this.districtTranslations[districtName] || districtName;
        translated.market = `${translatedDistrict} एपीएमसी`;
      } else {
        // Handle complex market names with suffixes like "Chandigarh(Grain/Fruit)", "Atmakur(SPS)"
        let marketName = translated.market;
        
        // Check if market has parentheses with type
        const marketMatch = marketName.match(/^([^(]+)(\(([^)]+)\))?$/);
        if (marketMatch) {
          const baseName = marketMatch[1].trim();
          const suffix = marketMatch[3];
          
          // Translate base name
          const translatedBase = this.marketTermTranslations[baseName] || baseName;
          
          // Translate suffix if present
          let translatedSuffix = '';
          if (suffix) {
            translatedSuffix = this.marketTermTranslations[suffix] || suffix;
            marketName = `${translatedBase}(${translatedSuffix})`;
          } else {
            marketName = translatedBase;
          }
        } else {
          // Simple market name translation
          marketName = this.marketTermTranslations[translated.market] || translated.market;
        }
        
        translated.market = marketName;
      }
    }

    // Translate demand level
    if (translated.demand) {
      translated.demand = this.demandTranslations[translated.demand] || translated.demand;
    }

    // Translate quality
    if (translated.quality) {
      translated.quality = this.qualityTranslations[translated.quality] || translated.quality;
    }

    return translated;
  }

  // Get available crops for filters
  getTranslatedCrops(language = 'en') {
    if (language === 'en') {
      return Object.keys(this.cropTranslations);
    }
    return Object.entries(this.cropTranslations).map(([en, hi]) => ({
      value: en,
      label: hi
    }));
  }

  // Get available states for filters
  getTranslatedStates(language = 'en') {
    if (language === 'en') {
      return Object.keys(this.stateTranslations);
    }
    return Object.entries(this.stateTranslations).map(([en, hi]) => ({
      value: en,
      label: hi
    }));
  }

  // Get available districts for a state
  getTranslatedDistricts(state, language = 'en') {
    // This would need to be enhanced with proper state-district mapping
    const allDistricts = Object.keys(this.districtTranslations);
    
    if (language === 'en') {
      return allDistricts;
    }
    return Object.entries(this.districtTranslations).map(([en, hi]) => ({
      value: en,
      label: hi
    }));
  }
}

module.exports = DataTranslation;