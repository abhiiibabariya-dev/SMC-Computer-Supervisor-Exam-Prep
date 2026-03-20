# મેઈન્ટેનન્સ આસિસ્ટન્ટ (ઈલેક્ટ્રિકલ) — અભ્યાસ સામગ્રી
# Maintenance Assistant (Electrical) — Study Material
## SMC ભરતી 2026 | 30 જગ્યાઓ | Pay: ₹21,700 - 69,100

---

## 🔓 Free Section / મફત વિભાગ

## 1. Basic Electrical Theory | મૂળભૂત વિદ્યુત સિદ્ધાંત

### 1.1 ઓહ્મનો નિયમ (Ohm's Law)
**V = I × R** (વોલ્ટેજ = કરન્ટ × રેઝિસ્ટન્સ)
- **V** = Voltage (Volts) — વિદ્યુત દબાણ (પાણીના દબાણ જેવું)
- **I** = Current (Ampere) — વિદ્યુત પ્રવાહ (પાણીના વહેણ જેવું)
- **R** = Resistance (Ohm Ω) — અવરોધ (પાઈપ સાંકડી જેવું)

### 1.2 Series & Parallel Circuit | શ્રેણી અને સમાંતર
| લક્ષણ | Series (શ્રેણી) | Parallel (સમાંતર) |
|---|---|---|
| Connection | End to end (છેડે છેડે) | Side by side (બાજુ બાજુ) |
| Current (I) | Same everywhere (સરખો) | Divides (ભાગલા) |
| Voltage (V) | Divides (ભાગલા) | Same everywhere (સરખો) |
| Total R | R₁ + R₂ + R₃ (વધે) | 1/R = 1/R₁ + 1/R₂ (ઘટે) |
| Example | Christmas lights | ઘરના સોકેટ |
| એક બલ્બ ફ્યુઝ | બધા બંધ | બાકી ચાલુ |

### 1.3 Power & Energy | શક્તિ અને ઊર્જા
| સૂત્ર | ઉપયોગ |
|---|---|
| P = V × I | Power (Watts) |
| P = I² × R | Power (R known) |
| P = V² / R | Power (V known) |
| E = P × t | Energy (kWh) |
| **1 Unit = 1 kWh** | 1000W × 1 hour |

**ઉદાહરણ**: 100W બલ્બ 10 કલાક ચાલે = 100 × 10 = 1000 Wh = **1 Unit**

### 1.4 AC Basics | AC મૂળભૂત
- **Frequency (India)**: 50 Hz (50 cycles per second)
- **Single Phase**: 230V, 2 wire (Phase + Neutral) — ઘરમાં
- **Three Phase**: 415V, 4 wire (R+Y+B+N) — ઉદ્યોગ/મોટર
- **Phase Color**: R = Red, Y = Yellow, B = Blue, N = Black, Earth = Green

---

## 2. Electrical Wiring | વિદ્યુત વાયરિંગ

### 2.1 Wiring Types (વાયરિંગ પ્રકારો)
| પ્રકાર | વર્ણન | ક્યાં |
|---|---|---|
| Conduit (PVC) | PVC પાઈપમાં વાયર | Modern building |
| Conduit (GI) | GI પાઈપમાં વાયર | Industry, damp areas |
| Concealed | દીવાલ/છતમાં છુપાયેલ | New construction |
| Surface/Batten | દીવાલ ઉપર | Old building, temporary |
| Casing-Capping | લાકડાની પટ્ટીમાં | Budget wiring |

### 2.2 Wire Color Coding (India)
| Wire | Color | ગુજરાતી | Purpose |
|---|---|---|---|
| Phase (Single) | Red | લાલ | Live/Hot wire |
| Phase R | Red | લાલ | 3-Phase R |
| Phase Y | Yellow | પીળો | 3-Phase Y |
| Phase B | Blue | વાદળી | 3-Phase B |
| Neutral | Black | કાળો | Return path |
| Earth | Green / Green-Yellow | લીલો | Safety ground |

### 2.3 Cable Selection (કેબલ પસંદગી)
| Load | Wire Size | Use |
|---|---|---|
| Light, Fan (5A) | 1.0 sq.mm | Lighting circuit |
| Power socket (15A) | 2.5 sq.mm | AC, Geyser, Fridge |
| Heavy load (20A) | 4.0 sq.mm | Water heater |
| Sub-main | 6.0-10 sq.mm | Distribution board |
| Main supply | 16-25 sq.mm | Meter to DB |

### 2.4 House Wiring Diagram (ઘર વાયરિંગ)
```
Electric Pole → Service Wire → Energy Meter → Main Switch → MCB Box
    ↓
Distribution Board (DB)
    ├── Circuit 1: Lights (1mm wire, 5A MCB)
    ├── Circuit 2: Fans (1mm wire, 5A MCB)
    ├── Circuit 3: Power sockets (2.5mm wire, 15A MCB)
    ├── Circuit 4: AC/Geyser (4mm wire, 20A MCB)
    └── ELCB/RCCB (30mA) for Earth leakage protection
```

---

## 3. Electrical Safety | વિદ્યુત સલામતી

### 3.1 Earthing (અર્થિંગ) — જીવનરક્ષક
**હેતુ**: Electric shock થી રક્ષણ

| Earthing Type | Method | ક્યાં |
|---|---|---|
| Pipe Earthing | GI pipe 38mm, 2.5m deep, coal+salt | ઘર |
| Plate Earthing | CI/Cu plate 60×60cm, 3m deep | મોટા બિલ્ડિંગ |
| Rod Earthing | Cu/GI rod 12mm, 2.5m deep | Pole, Tower |

**Earth resistance**: < 5 Ω (IE Rules)
**Testing**: Megger (500V for LV, 1000V for HV)
**Maintenance**: Water + Salt periodically in earth pit

### 3.2 Safety Devices (સલામતી ઉપકરણો)
| Device | Function | ગુજરાતી | Rating |
|---|---|---|---|
| MCB | Overload/Short circuit | લઘુ બ્રેકર | 5A, 10A, 16A, 20A, 32A |
| RCCB/ELCB | Earth leakage (30mA) | લિકેજ બ્રેકર | 30mA sensitivity |
| Fuse | Overcurrent (wire melts) | ફ્યુઝ | Rewirable, HRC, Kit-Kat |
| Isolator | Disconnects supply | આઈસોલેટર | No-load switching |
| MCCB | Heavy load protection | — | 100A-1600A |

### 3.3 Electric Shock First Aid (વિદ્યુત આંચકા પ્રાથમિક સારવાર)
1. **પાવર બંધ કરો** — Switch OFF / Plug remove
2. **સૂકી લાકડી/રબર** થી વ્યક્તિને અલગ કરો (ભીના હાથે ન અડો!)
3. **શ્વાસ ચકાસો** — Airway clear
4. **CPR** આપો જો શ્વાસ/નાડી ન હોય (30:2)
5. **108 / 112** પર ફોન કરો
6. દાઝ્યા પર ઠંડું પાણી લગાવો
7. હોસ્પિટલ લઈ જાવ

### 3.4 IE Rules 1956 (Indian Electricity Rules)
- **Rule 32**: Earthing of equipment mandatory
- **Rule 36**: Inspection of installations
- **Rule 44**: Precautions for live work
- **Rule 45**: Connected load declaration
- **Rule 50-62**: Safety requirements for HV installations
- **Rule 64**: Only licensed electrician for HV work

---

## 4. Electrical Machines | વિદ્યુત મશીનો

### 4.1 Motor Types & Use
| Motor | ઉપયોગ | Starting Method |
|---|---|---|
| Single Phase (FHP) | Fan, Pump, Cooler | Capacitor start |
| 3-Phase Induction (<5HP) | Small pump, Mixer | DOL (Direct On Line) |
| 3-Phase Induction (5-50HP) | Big pump, Compressor | Star-Delta |
| 3-Phase Induction (>50HP) | Heavy machinery | Auto-transformer / VFD |

### 4.2 Motor Troubleshooting (મોટર સમસ્યા નિવારણ)
| Problem | Cause | Solution |
|---|---|---|
| મોટર ચાલુ ન થાય | No supply, Fuse blown, OLR tripped | Supply check, Fuse change, OLR reset |
| મોટર ગરમ થાય | Overload, Low voltage, Bearing jam | Load ઓછો કરો, Voltage check, Bearing change |
| અવાજ આવે | Bearing worn, Coupling loose | Bearing/Coupling change |
| Single phasing | 1 phase missing | Supply check, Contactor check |
| Earth fault | Insulation damage | Megger test, Rewinding |

### 4.3 Transformer Basics
- **Step-down**: 11kV → 415V/240V (Distribution transformer)
- **Oil-filled**: Cooling, Insulation
- **Maintenance**: Oil level check, Breather silica gel, Earth check
- **Tap changer**: Voltage adjustment ±5%

---

## 5. Measurement Instruments | માપન સાધનો

| Instrument | Measures | ગુજરાતી | Range |
|---|---|---|---|
| Multimeter | V, I, R | મલ્ટીમીટર | Digital/Analog |
| Clamp meter | Current (without breaking) | ક્લેમ્પ | AC/DC Amps |
| Megger | Insulation resistance | મેગર | MΩ |
| Tong tester | Current | ટોંગ | Amps |
| Energy meter | kWh (units) | મીટર | Consumption |
| Phase sequence indicator | R-Y-B sequence | ફેઝ ક્રમ | Phase order |
| Earth tester | Earth resistance | અર્થ ટેસ્ટર | Ohms |
| Lux meter | Light intensity | લક્સ | Lux |

---

## 6. Maintenance Procedures | જાળવણી કાર્યવાહી

### 6.1 Preventive Maintenance Schedule
| Item | Frequency | Work |
|---|---|---|
| MCB/Switch check | Monthly | Tightness, heating signs |
| Earthing check | Quarterly | Resistance < 5Ω |
| Motor bearing grease | 6 monthly | Lubrication |
| Transformer oil | Yearly | BDV test, oil level |
| Cable insulation | Yearly | Megger test |
| Lightning arrester | Before monsoon | Spark gap, Earth check |
| Battery (UPS) | Quarterly | Water level, terminal clean |
| Generator | Monthly | Start test, fuel, oil, coolant |

### 6.2 LOTO (Lock Out Tag Out) — ખૂબ મહત્વનું
**Before maintenance on electrical equipment:**
1. **Inform** — Supervisor/in-charge ને જાણ કરો
2. **Identify** — Energy source ઓળખો
3. **Isolate** — Switch OFF, Isolator OFF
4. **Lock** — Padlock લગાવો (તમારી ચાવી)
5. **Tag** — "DO NOT SWITCH ON" tag લગાવો
6. **Test** — Voltage absence confirm (tester/multimeter)
7. **Work** — હવે સલામત રીતે કામ કરો
8. **Remove** — કામ પૂરું → Lock/Tag remove → Switch ON

---

## 🔒 Premium Content — ₹49
> PLC basics, SCADA, Advanced Motor Control, Panel Wiring,
> 300+ MCQs, Mock Tests, Previous Papers
> Visit: premium.html

---

## 7. સામાન્ય જ્ઞાન (Free)
- ગુજરાત: 1 મે 1960, ગાંધીનગર, 33 જિલ્લા
- સુરત: તાપી નદી, ડાયમંડ સિટી, SMC 1966
- વીજળીનો શોધક: Thomas Edison (DC), Nikola Tesla (AC)
- 1 HP = 746 Watts | 1 Unit = 1 kWh

---

*SMC Maintenance Assistant (Electrical) Exam 2026*
