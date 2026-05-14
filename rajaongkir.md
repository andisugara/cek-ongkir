1.province

curl --location 'https://rajaongkir.komerce.id/api/v1/destination/province' \
--header 'Key: YOUR_API_KEY'

{
"meta": {
"message": "Success Get Province",
"code": 200,
"status": "success"
},
"data": [
{
"id": 1,
"name": "NUSA TENGGARA BARAT (NTB)"
},
{
"id": 2,
"name": "NUSA TENGGARA BARAT"
},
....
]
}

2.city
curl --location 'https://rajaongkir.komerce.id/api/v1/destination/city/12' \
--header 'Key: YOUR_API_KEY'
{
"meta": {
"message": "Success Get District By City ID",
"code": 200,
"status": "success"
},
"data": [
{
"id": 1360,
"name": "JAKARTA SELATAN",
"zip_code": "0"
},
{
"id": 1361,
"name": "JAGAKARSA",
"zip_code": "12630"
},
]
}

3.district
curl --location 'https://rajaongkir.komerce.id/api/v1/destination/district/575' \
--header 'Key: YOUR_API_KEY'

{
"meta": {
"message": "Success Get District By City ID",
"code": 200,
"status": "success"
},
"data": [
{
"id": 1360,
"name": "JAKARTA SELATAN",
"zip_code": "0"
},
{
"id": 1361,
"name": "JAGAKARSA",
"zip_code": "12630"
},
]
}

4.subdistrict
curl --location 'https://rajaongkir.komerce.id/api/v1/destination/sub-district/5823' \
--header 'Key: YOUR_API_KEY'

{
"meta": {
"message": "Success Get Sub District By District ID",
"code": 200,
"status": "success"
},
"data": [
{
"id": 68513,
"name": "BALERAKSA",
"zip_code": "53355"
},
{
"id": 68514,
"name": "GRANTUNG",
"zip_code": "53355"
},
]
}

5.calculate
curl --location 'https://rajaongkir.komerce.id/api/v1/calculate/district/domestic-cost' \
--header 'key: YOUR_API_KEY' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'origin=1391' \
--data-urlencode 'destination=1376' \
--data-urlencode 'weight=1000' \
--data-urlencode 'courier=jne:sicepat:ide:sap:jnt:ninja:tiki:lion:anteraja:pos:ncs:rex:rpx:sentral:star:wahana:dse' \
--data-urlencode 'price=lowest'

{
"meta": {
"message": "Success Calculate Domestic Shipping cost",
"code": 200,
"status": "success"
},
"data": [
{
"name": "Wahana",
"code": "wahana",
"service": "Express",
"description": "Layanan Regular Pengiriman Ke Seluruh Wilayah Indonesia",
"cost": 7000,
"etd": "3 day"
},
{
"name": "Wahana",
"code": "wahana",
"service": "Ekonomis",
"description": "Layanan Pengiriman Biaya Hemat Dengan Tujuan Sumatera",
"cost": 7000,
"etd": "3 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "ECO",
"description": "Economy Service",
"cost": 8000,
"etd": "4 day"
},
{
"name": "21 Express",
"code": "dse",
"service": "REG2023",
"description": "Reg2023",
"cost": 9000,
"etd": "1-2 day"
},
{
"name": "21 Express",
"code": "dse",
"service": "REG2024",
"description": "Reg2024",
"cost": 9000,
"etd": "1-2 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "DAT",
"description": "Tiki Daun",
"cost": 9000,
"etd": "2 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "REG",
"description": "Reguler Service",
"cost": 9000,
"etd": "2 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "SRP",
"description": "Tiki Sirip",
"cost": 9000,
"etd": "2 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "TRX",
"description": "Tiki Tirex",
"cost": 9000,
"etd": "2 day"
},
{
"name": "J&T Express",
"code": "jnt",
"service": "EZ",
"description": "Reguler",
"cost": 9000,
"etd": ""
},
{
"name": "Royal Express Indonesia (REX)",
"code": "rex",
"service": "REG",
"description": "Regular",
"cost": 9000,
"etd": "2-2 day"
},
{
"name": "Ninja Xpress",
"code": "ninja",
"service": "STANDARD",
"description": "Standard Service",
"cost": 9900,
"etd": ""
},
{
"name": "21 Express",
"code": "dse",
"service": "ECO",
"description": "Eco",
"cost": 10000,
"etd": "2-4 day"
},
{
"name": "21 Express",
"code": "dse",
"service": "REGULAR",
"description": "Regular",
"cost": 10000,
"etd": "2-4 day"
},
{
"name": "Royal Express Indonesia (REX)",
"code": "rex",
"service": "EXP",
"description": "Express",
"cost": 10000,
"etd": "2-2 day"
},
{
"name": "ID Express",
"code": "ide",
"service": "STD",
"description": "Std",
"cost": 10500,
"etd": "0-0 day"
},
{
"name": "Jalur Nugraha Ekakurir (JNE)",
"code": "jne",
"service": "REG",
"description": "Layanan Reguler",
"cost": 11000,
"etd": "1 day"
},
{
"name": "SiCepat Express",
"code": "sicepat",
"service": "REG",
"description": "Reguler",
"cost": 11000,
"etd": "2-3 day"
},
{
"name": "POS Indonesia (POS)",
"code": "pos",
"service": "Pos Reguler",
"description": "240",
"cost": 11500,
"etd": "3 day"
},
{
"name": "AnterAja",
"code": "anteraja",
"service": "REG",
"description": "Anteraja Regular",
"cost": 11800,
"etd": "1-2 day"
},
{
"name": "21 Express",
"code": "dse",
"service": "ECO2019",
"description": "Eco2019",
"cost": 12000,
"etd": "3-4 day"
},
{
"name": "POS Indonesia (POS)",
"code": "pos",
"service": "PAKETPOS DANGEROUS GOODS",
"description": "Pdg",
"cost": 13500,
"etd": "3 day"
},
{
"name": "POS Indonesia (POS)",
"code": "pos",
"service": "PAKETPOS VALUABLE GOODS",
"description": "Pvg",
"cost": 13500,
"etd": "3 day"
},
{
"name": "Satria Antaran Prima",
"code": "sap",
"service": "UDRREG",
"description": "Reguler",
"cost": 13500,
"etd": "3-5 day"
},
{
"name": "Lion Parcel",
"code": "lion",
"service": "REGPACK",
"description": "Regular Service",
"cost": 14974,
"etd": "3-6 day"
},
{
"name": "21 Express",
"code": "dse",
"service": "ECO2019_14JAN",
"description": "Eco2019_14jan",
"cost": 15000,
"etd": "1-2 day"
},
{
"name": "Nusantara Card Semesta",
"code": "ncs",
"service": "NRS",
"description": "Regular Service",
"cost": 15000,
"etd": "2-3 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "ONS",
"description": "Over Night Service",
"cost": 18000,
"etd": "1 day"
},
{
"name": "POS Indonesia (POS)",
"code": "pos",
"service": "Pos Nextday",
"description": "447",
"cost": 19000,
"etd": "1 day"
},
{
"name": "Satria Antaran Prima",
"code": "sap",
"service": "UDRONS",
"description": "Nextday",
"cost": 22000,
"etd": "1-2 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "TRC",
"description": "Trucking",
"cost": 25000,
"etd": "5 day"
},
{
"name": "Nusantara Card Semesta",
"code": "ncs",
"service": "NFO",
"description": "Nfd-One Night Service",
"cost": 29000,
"etd": "1-1 day"
},
{
"name": "Wahana",
"code": "wahana",
"service": "Kargo",
"description": "Layanan Pengiriman Dengan Minimal Berat 10 Kg",
"cost": 30000,
"etd": "4 day"
},
{
"name": "Satria Antaran Prima",
"code": "sap",
"service": "DRGREG",
"description": "Cargo",
"cost": 35000,
"etd": "3-6 day"
},
{
"name": "Royal Express Indonesia (REX)",
"code": "rex",
"service": "REX-10",
"description": "Rex-10",
"cost": 45000,
"etd": "4-4 day"
},
{
"name": "Jalur Nugraha Ekakurir (JNE)",
"code": "jne",
"service": "JTR",
"description": "JNE Trucking",
"cost": 50000,
"etd": "3 day"
},
{
"name": "SiCepat Express",
"code": "sicepat",
"service": "GOKIL",
"description": "Cargo Per Kg (Minimal 10kg)",
"cost": 50000,
"etd": "2-3 day"
},
{
"name": "Nusantara Card Semesta",
"code": "ncs",
"service": "DARAT",
"description": "Regular Darat",
"cost": 65000,
"etd": "4-5 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "T15",
"description": "Motor Di Bawah 150cc/1500watt",
"cost": 400000,
"etd": "5 day"
},
{
"name": "Jalur Nugraha Ekakurir (JNE)",
"code": "jne",
"service": "JTR<130",
"description": "JNE Trucking",
"cost": 500000,
"etd": "3 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "T25",
"description": "Motor Di Bawah 250cc/Di Atas 1500watt",
"cost": 650000,
"etd": "5 day"
},
{
"name": "Jalur Nugraha Ekakurir (JNE)",
"code": "jne",
"service": "JTR>130",
"description": "JNE Trucking",
"cost": 800000,
"etd": "3 day"
},
{
"name": "Citra Van Titipan Kilat (TIKI)",
"code": "tiki",
"service": "T60",
"description": "Motor Di Bawah 600cc/Non Standar/Roda 3",
"cost": 900000,
"etd": "5 day"
},
{
"name": "Jalur Nugraha Ekakurir (JNE)",
"code": "jne",
"service": "JTR>200",
"description": "JNE Trucking",
"cost": 1000000,
"etd": "3 day"
}
]
}
