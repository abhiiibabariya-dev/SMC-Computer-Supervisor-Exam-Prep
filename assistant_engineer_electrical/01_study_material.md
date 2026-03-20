# આસિસ્ટન્ટ ઈજનેર (ઈલેક્ટ્રિકલ) — અભ્યાસ સામગ્રી
# Assistant Engineer (Electrical) — Study Material
## SMC ભરતી 2026 | 57 જગ્યાઓ | Pay: ₹39,900 - 1,26,600

---

## 🔓 Free Section

## 1. વિદ્યુત મૂળભૂત | Electrical Fundamentals

### 1.1 ઓહ્મનો નિયમ (Ohm's Law)
**V = I × R**
- V = વોલ્ટેજ (Volt) — વિદ્યુત દબાણ
- I = કરન્ટ (Ampere) — વિદ્યુત પ્રવાહ
- R = રેઝિસ્ટન્સ (Ohm Ω) — અવરોધ

### 1.2 કિર્ચહોફના નિયમો (Kirchhoff's Laws)
**KCL (કરન્ટ નિયમ)**: જંક્શન પર આવતો કરન્ટ = જતો કરન્ટ (ΣI = 0)
**KVL (વોલ્ટેજ નિયમ)**: બંધ લૂપમાં EMF નો સરવાળો = Voltage drop નો સરવાળો (ΣV = 0)

### 1.3 પાવર સૂત્રો (Power Formulas)
| સૂત્ર | ઉપયોગ |
|---|---|
| P = V × I | Power = Voltage × Current |
| P = I² × R | Power (resistance known) |
| P = V² / R | Power (voltage known) |
| E = P × t | Energy = Power × Time |
| 1 Unit = 1 kWh | 1000W × 1 hour |

### 1.4 AC vs DC
| લક્ષણ | AC (Alternating Current) | DC (Direct Current) |
|---|---|---|
| ગુજરાતી | પ્રત્યાવર્તી પ્રવાહ | સમ પ્રવાહ |
| દિશા | બદલાતી રહે | એક જ દિશા |
| Frequency | 50 Hz (India) | 0 Hz |
| ઉત્પાદન | Generator/Alternator | Battery, Solar cell |
| ટ્રાન્સમિશન | લાંબા અંતર | ટૂંકા અંતર |
| ઉપયોગ | ઘર, ઉદ્યોગ | ઈલેક્ટ્રોનિક્સ, બેટરી |

---

## 2. વિદ્યુત મશીનો | Electrical Machines

### 2.1 ટ્રાન્સફોર્મર (Transformer) — વોલ્ટેજ બદલે
**કાર્ય સિદ્ધાંત**: Faraday's Law of Electromagnetic Induction
**E₁/E₂ = N₁/N₂ = I₂/I₁**

| પ્રકાર | કાર્ય | ઉપયોગ |
|---|---|---|
| Step-up | વોલ્ટેજ વધારે | Power station → Transmission |
| Step-down | વોલ્ટેજ ઘટાડે | Transmission → Distribution |
| Distribution | 11kV → 415V/240V | ઘરે/દુકાને વીજળી |
| Instrument | CT/PT | માપન (Measurement) |

**Losses in Transformer:**
- Copper loss (I²R) — winding resistance
- Iron/Core loss — Hysteresis + Eddy current
- Efficiency = Output/Input × 100%

### 2.2 DC મોટર (DC Motor)
**Fleming's Left Hand Rule**: ચુંબકીય ક્ષેત્રમાં current-carrying conductor ને force મળે

| પ્રકાર | લક્ષણ | ઉપયોગ |
|---|---|---|
| Series | High starting torque | Crane, Traction, Lift |
| Shunt | Constant speed | Lathe, Drill, Fan |
| Compound | Medium torque + speed | Compressor, Elevator |

### 2.3 AC મોટર (AC Motor)
**3-Phase Induction Motor** — ઉદ્યોગમાં સૌથી વધુ

| ઘટક | કાર્ય |
|---|---|
| Stator | ફરતું ચુંબકીય ક્ષેત્ર બનાવે (Rotating Magnetic Field) |
| Rotor | Squirrel cage / Wound rotor |
| Slip | Ns - N / Ns (synchronous - actual speed) |
| Starting | DOL, Star-Delta, Auto-transformer |

**Speed**: N = 120f/P (f = frequency, P = poles)
- 50 Hz, 4 pole = 120×50/4 = 1500 RPM (synchronous)

### 2.4 મોટર સ્ટાર્ટર (Motor Starters)
| સ્ટાર્ટર | ક્ષમતા | લક્ષણ |
|---|---|---|
| DOL (Direct On Line) | <5 HP | સીધો ચાલુ, high starting current |
| Star-Delta | 5-50 HP | Starting current 1/3 ઓછો |
| Auto-transformer | >50 HP | Variable voltage starting |
| VFD (Variable Frequency Drive) | કોઈ પણ | Speed control, soft start |

---

## 3. વિદ્યુત સ્થાપન | Electrical Installation

### 3.1 Wiring Systems (વાયરિંગ પ્રણાલી)
| પ્રકાર | ઉપયોગ | ફાયદો |
|---|---|---|
| Conduit (PVC/GI) | ઘર, ઓફિસ | સલામત, ટકાઉ |
| Concealed | Modern building | દેખાય નહીં |
| Surface | Factory, temporary | Easy maintenance |
| Casing-Capping | Old buildings | Cheap, easy |

### 3.2 Earthing (અર્થિંગ) — સૌથી મહત્વનું
**હેતુ**: Electric shock થી રક્ષણ, Equipment safety

| પ્રકાર | ક્યાં વાપરવું |
|---|---|
| Pipe earthing | ઘર, નાના બિલ્ડિંગ |
| Plate earthing | મોટા બિલ્ડિંગ, ઉદ્યોગ |
| Rod earthing | Tower, Pole |
| Strip earthing | Substation |

**Earth resistance**: < 5 ohm (IS standard)
**Megger** — insulation resistance test

### 3.3 Safety Devices (સલામતી ઉપકરણો)
| ઉપકરણ | કાર્ય | ગુજરાતી |
|---|---|---|
| MCB | Overload/Short circuit protection | લઘુ સર્કિટ બ્રેકર |
| ELCB/RCCB | Earth leakage protection (30mA) | અર્થ લિકેજ બ્રેકર |
| Fuse | Overcurrent protection | ફ્યુઝ (તાર ઓગળે) |
| Lightning Arrester | Lightning protection | વીજળી રક્ષક |
| Surge Protector | Voltage spike protection | સર્જ પ્રોટેક્ટર |

### 3.4 Cable Color Coding (India)
| Wire | Color | ગુજરાતી |
|---|---|---|
| Phase (R) | Red | લાલ |
| Phase (Y) | Yellow | પીળો |
| Phase (B) | Blue | વાદળી |
| Neutral | Black | કાળો |
| Earth | Green/Green-Yellow | લીલો |

---

## 4. Power Systems (વિદ્યુત વિતરણ)

### 4.1 ભારતીય Power System
| સ્તર | Voltage | ઉપયોગ |
|---|---|---|
| Generation | 11-33 kV | Power plant |
| Transmission | 132-765 kV | લાંબા અંતર |
| Sub-transmission | 33-66 kV | શહેર સુધી |
| Distribution | 11 kV | વિસ્તાર સુધી |
| Consumer | 415V (3φ) / 240V (1φ) | ઘર/દુકાન |

### 4.2 Power Factor
- **Power Factor = cos φ = kW/kVA**
- Ideal: 1.0 (Unity) | Acceptable: >0.85
- Low PF = High current = More losses = Penalty
- Improvement: Capacitor bank, Synchronous condenser

### 4.3 Tariff (વીજળી બિલ)
- 1 Unit = 1 kWh = 1000W × 1 hour
- Energy charge (₹/unit) + Fixed charge + Power factor surcharge
- TOD (Time of Day) tariff — peak/off-peak rates

---

## 🔒 Premium Content — ₹49
> Advanced Protection Systems, Substation Design, PLC/SCADA,
> IS Standards, 300+ MCQs, Mock Tests
> Visit: premium.html

---

## 5. Electrical Safety (વિદ્યુત સલામતી)
- **Electric shock first aid**: Switch off → Remove from contact → CPR if needed → Hospital
- **PPE**: Insulated gloves, Safety shoes, Helmet, Goggles
- **Permit to work system** — High voltage work authorization
- **IE Rules 1956** — Indian Electricity Rules for safety
- **Lock Out Tag Out (LOTO)** — Before maintenance

---

*SMC Assistant Engineer (Electrical) Exam 2026*


---

## 📚 Engineering Books | એન્જિનિયરિંગ પુસ્તકો

| Book | Author | Subject | Use For |
|---|---|---|---|
| RCC Design | BC Punmia | Reinforced Concrete | AE Civil |
| Strength of Materials | RK Rajput | SOM, Mechanics | All Engineering |
| Surveying Vol 1 & 2 | BC Punmia | Surveying | AE Civil, Town Planner |
| Electrical Technology | BL Theraja | Electrical Machines | AE Electrical |
| Electrical Wiring | S.L. Uppal | Wiring, Installation | AE Electrical, Maint Asst |
| IE Rules 1956 | BIS | Electrical Safety | AE Electrical |
| IS 456:2000 | BIS | RCC Code | AE/DE Civil |
| Workshop Technology | Hajra Choudhary | Workshop, Fitting | Fitter, Technical Asst |
| Engineering Drawing | ND Bhatt | Drawing, Projections | All Engineering |
| GDCR Gujarat | Gujarat Govt | Development Rules | Town Planner |
| Estimation & Costing | BN Dutta | Estimation | AE Civil |
| ITI Trade Theory | NIMI | Trade specific | Fitter, Electrician |

### 🎥 Engineering YouTube Channels
| Channel | Subject | Link |
|---|---|---|
| **Ekeeda** | Civil, Electrical, Mech | [youtube.com/@Ekeeda](https://www.youtube.com/@Ekeeda) |
| **Gate Academy** | Engineering Subjects | Search: "Gate Academy" on YouTube |
| **5 Minutes Engineering** | Quick Concepts | Search: "5 minutes engineering" on YouTube |
| **Learning Engineering** | Animations, Concepts | Search: "Learning Engineering" on YouTube |
| **Electrical Engineering** | Electrical Machines, Power | Search: "Electrical engineering basics Hindi" on YouTube |
| **Civil Engineering Academy** | Construction, RCC | Search: "Civil engineering Hindi" on YouTube |
| **ITI Exam Preparation** | Fitter, Electrician | Search: "ITI fitter exam preparation" on YouTube |


---

## 📚 ભલામણ કરેલ પુસ્તકો | Recommended Books

| પુસ્તક (Book) | લેખક/પ્રકાશક | વિષય | ભાષા |
|---|---|---|---|
| Lucent's General Knowledge | Lucent Publication | GK, Current Affairs | Hindi/English |
| Gujarat no Itihas (ગુજરાતનો ઈતિહાસ) | Anamika Academy | Gujarat History & Culture | ગુજરાતી |
| Gujarat ni Bhugol (ગુજરાતની ભૂગોળ) | Anamika Academy | Gujarat Geography | ગુજરાતી |
| Bharat nu Bandharan (ભારતનું બંધારણ) | World Inbox | Indian Constitution | ગુજરાતી |
| World Inbox GK Book | World Inbox Publication | Complete GK | ગુજરાતી |
| Liberty GK Book | Liberty Publication | Gujarat & India GK | ગુજરાતી |
| Angle GK | Angle Academy | General Knowledge | ગુજરાતી |
| Maths by Rakesh Yadav | Rakesh Yadav | Quantitative Aptitude | Hindi |
| RS Aggarwal Reasoning | S.Chand | Logical Reasoning | English |
| Gujarati Vyakaran (વ્યાકરણ) | Akshar Publication | Gujarati Grammar | ગુજરાતી |
| Current Affairs Monthly | Yojana/Pratiyogita Darpan | Current Affairs | Hindi/English |
| Computer Knowledge by Arihant | Arihant Publication | Computer Basics, CCC | English/Hindi |

## 🎥 YouTube Channels & Videos | યુટ્યુબ ચેનલ

### Gujarat Exam Preparation Channels
| Channel | વિષય (Subject) | ભાષા | Link |
|---|---|---|---|
| **World Inbox** | GK, Maths, Reasoning, Gujarat | ગુજરાતી | [youtube.com/@WorldInbox](https://www.youtube.com/@WorldInbox) |
| **Anamika Academy** | Gujarat GK, History, Geography | ગુજરાતી | [youtube.com/@AnamikaAcademy](https://www.youtube.com/@AnamikaAcademy) |
| **Liberty Career Academy** | GPSC, GSSSB, Current Affairs | ગુજરાતી | [youtube.com/@LibertyCareerAcademy](https://www.youtube.com/@LibertyCareerAcademy) |
| **Angle Academy** | Maths, Reasoning, GK | ગુજરાતી | [youtube.com/@AngleAcademy](https://www.youtube.com/@AngleAcademy) |
| **ICE Rajkot** | Gujarat Govt Exams | ગુજરાતી | [youtube.com/@ICERajkot](https://www.youtube.com/@ICERajkot) |
| **Utkarsh Classes** | All Competitive Exams | Hindi | [youtube.com/@UtkarshClasses](https://www.youtube.com/@UtkarshClasses) |
| **Study IQ** | Current Affairs, GK | Hindi/English | [youtube.com/@StudyIQ](https://www.youtube.com/@StudyIQ) |
| **Unacademy Gujarat** | Gujarat State Exams | ગુજરાતી | [youtube.com/@UnacademyGujarat](https://www.youtube.com/@UnacademyGujarat) |

### Subject-Specific Videos
| વિષય | Video/Playlist | Link |
|---|---|---|
| Gujarat GK Complete | World Inbox Full Course | Search: "World Inbox Gujarat GK" on YouTube |
| Indian Constitution | Bharat nu Bandharan | Search: "ભારતનું બંધારણ" on YouTube |
| Maths Shortcuts | Angle Academy Maths | Search: "Angle Academy Maths tricks" on YouTube |
| Computer CCC | CCC Exam Preparation | Search: "CCC exam preparation Gujarati" on YouTube |
| Current Affairs 2026 | Daily Current Affairs | Search: "Gujarat current affairs 2026" on YouTube |
| English Grammar | Basic English Grammar | Search: "English grammar for competitive exams" on YouTube |

## 🌐 ઉપયોગી વેબસાઈટ | Useful Websites

| Website | Purpose | Link |
|---|---|---|
| **SMC Official** | Recruitment, Results | [suratmunicipal.gov.in](https://www.suratmunicipal.gov.in) |
| **OJAS Gujarat** | All Gujarat Govt Jobs | [ojas.gujarat.gov.in](https://ojas.gujarat.gov.in) |
| **GPSC Official** | Class 1-2 Exams | [gpsc.gujarat.gov.in](https://gpsc.gujarat.gov.in) |
| **GSSSB Official** | Clerk, Head Clerk | [gsssb.gujarat.gov.in](https://gsssb.gujarat.gov.in) |
| **Gujarat Rojgar Samachar** | Weekly Job Updates | [gujaratrojgarsamachar.gov.in](https://gujaratrojgarsamachar.gov.in) |
| **Testbook** | Mock Tests, Practice | [testbook.com](https://testbook.com) |
| **Gradeup/BYJU's Exam Prep** | Study Material | [byjusexamprep.com](https://byjusexamprep.com) |
| **GK Today** | Current Affairs Daily | [gktoday.in](https://www.gktoday.in) |

## 📱 Mobile Apps for Preparation

| App | Platform | Features |
|---|---|---|
| **Testbook** | Android/iOS | Mock tests, Previous papers, Daily GK |
| **Adda247** | Android/iOS | Gujarat exam prep, Quizzes |
| **Gradeup** | Android/iOS | Video classes, Tests |
| **Current Affairs App** | Android | Daily CA in Gujarati |
| **Gujarati Dictionary** | Android | Word meanings, Synonyms |
