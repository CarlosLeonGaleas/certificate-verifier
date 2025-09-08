const html_BACKGROUND004 = `
<!DOCTYPE html>
<html style="-webkit-print-color-adjust: exact; margin: 0">
<head>
    <title>{{web-title}}</title>
    <!-- fonts -->
    <!-- Name Certificate -->
    <link rel="icon" href="https://res.cloudinary.com/dvjnqwzpc/image/upload/v1720111589/blockchain-webpage/cerif-logo_xkfm37.ico" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Playball&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Playball&display=swap"
        rel="stylesheet">
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #28348A;
            font-family: "Montserrat", sans-serif;
            transform-origin: 0 0;
            transform: scale(1);
            min-height: 21cm;
            min-width: 29.7cm;
            max-height: 21cm;
            max-width: 29.7cm;
        }

        .bodydiv {
            top: 0;
            left: 0;
            right: 0;
            height: 21cm !important;
            width: 29.7cm !important;
            position: absolute;
            display: flex;
            flex-direction: row;
        }

        @page {
            size: A4 landscape;
            margin: 0;
            min-height: 21cm;
            min-width: 29.7cm;
            max-height: 21cm;
            max-width: 29.7cm;
        }

        .page-background {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            min-height: 21cm;
            min-width: 29.7cm;
            max-height: 21cm;
            max-width: 29.7cm;
            z-index: -1;
            background: white;
            background-image: url(https://res.cloudinary.com/dkzhem9dj/image/upload/v1751575559/Nueva-Plantilla-de-los-certificados_dtyv6m.svg);
            background-position: fixed;
            background-repeat: repeat;
            background-size: cover;
        }

        .qr-code {
            display: flex;
            flex-direction: column;
            justify-content: start;
            margin-top: 0cm;
            margin-left: 24cm;
        }

        .logos-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 90px;
            margin-bottom: 40px;
            margin-left: 80px;
            width: 81%;
        }
        
        
        .logo1{
            width: 240px;
            height: 60px;
            object-fit: contain;
        }
        .logo2{
            width: 240px;
            height: 67px;
            object-fit: contain;
            object-position: right;
        }

        .name-participant-section {
            margin-left: 2cm;
            margin-right: 1cm;
            width: 82%;
            padding-bottom: 0.5cm;
        }

        .participant-name {
            font-family: "Playball", cursive !important;
            font-weight: 400;
            font-style: normal;
            color: #28348A;
            font-size: 1.1cm;
        }

        h1 {
            font-size: 1cm;
            margin-bottom: 1cm;
        }

        p {
            font-size: .5cm;
        }

        .playball-regular {
            font-family: "Playball", regular;
            font-weight: 400;
            font-style: normal;
            color: #28348A;
        }

        .montserrat-text {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-weight: 400;
            font-size: 0.4cm !important;
            font-style: normal;
            text-align: justify;
        }
        .montserrat-text-2 {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-weight: 400;
            font-size: 0.4cm !important;
            font-style: normal;
            text-align: right;
            margin-top: 0.8cm;
        }
        .montserrat-text-banner {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-weight: 400;
            font-style: normal;
        }
        .montserrat-text-sign {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-weight: 400;
            font-style: normal;
        }
        .montserrat-text-sign {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-weight: 300;
            font-style: normal;

        }
        .montserrat-bold-text {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-weight: 650;
            font-size: 0.8cm !important;
            font-style: normal;
        }
        .montserrat-bold-text-2 {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-weight: 800;
            font-size: 0.65cm !important;
            font-style: normal;
            margin-top: -0.2cm;
            margin-bottom: -0.2cm;
        }

        .hash-style {
            font-size: 0.25cm;
        }

        .hash-style {
            text-decoration: none;
            color: #28348A;
            text-orientation:  sideways;
            writing-mode: vertical-lr;
            align-self: flex-end;
            margin-bottom: 0.2cm;
            padding-right: 0.2cm;
            margin-top: -4cm;
        }

        .hash-style:active {
            color: #28348A;
        }

        .pill {
            display: flex;
            justify-content: center;
            align-items: center;
            width: auto;
            margin-top: 0.5cm;
            height: 1cm;
            background: #3c55c4;
            border-radius: 999em 999em 999em 40px;
        }
        .name-section {
            display: flex;
            flex-direction: column;
            min-height: 2cm;
            max-height: 2cm;
            justify-content: center;
            align-items: center;
            /* border: #28348A solid; */
        }
        
        .linea {
            margin-top: -1cm !important;
            border-top: 1.5px solid #28348A;
            height: 2px;
        }
        .sign-linea {
            border-top: 1.5px solid #28348A;
            height: 2px;
        }
        .signs-section {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            margin-top: 50px;
            margin-bottom: -1cm;
        }
        .col2{
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: end;
            margin-left: -0.8cm;
            padding-right: 0.2cm;
            padding-bottom: 0.4cm;
            margin-top: 6cm;
            width: 100px !important;
        }
        .blockchain-id-section {
            display: flex;
            justify-content: center;
            align-content: center;
            align-items: center;
            align-self: center;
            width: auto;
            margin-top: 0cm;
            height: 1cm;
            background: #3c55c4 !important;
            border-radius: 999em 999em 999em 40px;
            margin-left: 4cm;
        }
        .blockchain-banner-section {
            display: flex;
            justify-content: center;
            align-items: center;
            align-self: center;
            width: 2.5cm;
            height: 1.1cm;
            border-radius: 1em;
            max-width: 3cm
        }
        .col0 {
            height: 100%;
            width: 105px !important;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: end;
        }
        .col1 {
            width: 100%;
        }
    </style>
</head>

<body style="margin: 0">
    <div class="page-background"></div>
    <div class="bodydiv">
        <div class="col0">
            <div class="blockchain-id-section">
            <a href="{{url-tokenid}}" style="text-decoration: none; color: inherit;">
                <p class="montserrat-text-banner" 
                style="font-size: 0.24cm;color: white;position: relative; width: 1.5cm; margin-bottom: 0.4cm;
                margin-left: -3.1cm;background: #ff8300 !important; height: 0.5cm; align-content: center; 
                align-items: center; border-radius: 1em; max-width: 3cm;"
                >
                <strong>N° {{tokenID}}</strong></p>  
            </a>
            </div>
        </div>
        <div class="col1">
            <div class="logos-section">
                <img src="https://res.cloudinary.com/dkzhem9dj/image/upload/v1747948126/blockchain-webpage/Logo-UniversitarioRU-Azul_fgiaqkko8.svg" alt="Logo del Universitario Rumiñahui" class="logo1"/>
                <img src="https://res.cloudinary.com/dkzhem9dj/image/upload/v1751575832/Investigaci%C3%B3n_LogoColor_wz6w9b.svg" alt="Logo del Departamento de Investigación" class="logo2"/>
            </div>
            <div class="name-participant-section">
                <h1 class="montserrat-bold-text">El Instituto Tecnológico Superior Rumiñahui y el Departamento de Investigación</h1>
                <h1 class="montserrat-bold-text-2">CERTIFICAN A:</h1>
                <h1 class="participant-name"><strong>{{name}}</strong></h1>
                <!-- <hr> -->
                <div class="linea"></div>
                <p class="montserrat-text">{{description}}</p>
                <p></p>
                <p class="montserrat-text-2">{{issuedAt}}</p>
                <div class="signs-section">
                    <div>
                        <img style="width: 5.5cm;height: 3.1cm; margin-top: 0.2cm; margin-bottom: -1.1cm;" src="https://res.cloudinary.com/dkzhem9dj/image/upload/v1748445553/blockchain-webpage/FirmaER_chp9u5tpmc4.svg" alt="Instructor sign">
                        <div style="margin-top: 0.4cm;" class="sign-linea"></div>
                        <p style="margin-top: 0cm;font-size: 0.4cm !important;" class="montserrat-text-sign">Mg. Edwin Ramón</p>
                        <p style="margin-top: -0.35cm;font-size: 0.35cm !important;" class="montserrat-text-sign"><strong>INSTRUCTOR</strong></p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col2">
            <a href="{{url-hash}}" class="hash-style" target="_blank" rel="noopener noreferrer">Hash: {{transactionHash}}</a>
            <img style="max-width: 2.8cm;" src="data:image/png;base64,{{transactionHashQRBase64}}" alt="QR code to validate certificate">
            <a href="{{url-blockchain}}" style="text-decoration: none; color: inherit; display: block; height: 1.1cm; width: 2.5cm; margin-right: 0.15cm;">
                <div class="blockchain-banner-section">
                    <p class="montserrat-text-banner" 
                    style="font-size: 0.24cm;color: white;position: absolute; width: 2.5cm; background: #ff8300 !important; height: 1.1cm; 
                    align-content: center; align-items: center; border-radius: 1em; max-width: 3cm;"
                    >
                    <strong>Validado con Tecnología Blockchain NFT</strong></p>  
                </div>
            </a>
        </div>
    </div>
    <!-- Script para imprimir página -->
    <script>
        // Espera a que el documento HTML completo se cargue
        window.onload = function() {
            setTimeout(function() {
                var userResponse = confirm("¿Desea imprimir el certificado?");
                if (userResponse) {
                    window.print();
                }
            }, 3000); // 3 segundos
        };
    </script>
</body>
</html>
`
export default html_BACKGROUND004