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
