const html_BACKGROUND008 = `
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
        @font-face {
            font-family: "KarbonSemiBold";
            src: url("./fonts/Karbon-Semibold.otf") format("opentype");
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: "KarbonBold";
            src: url("./fonts/Karbon-Bold.otf") format("opentype");
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: "KarbonBoldItalic";
            src: url("./fonts/Karbon-BoldItalic.otf") format("opentype");
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: "KarbonSlabStencilRegular";
            src: url("./fonts/Karbon-Medium.otf") format("opentype");
            font-weight: bold;
        }
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
            background-image: url(https://res.cloudinary.com/dkzhem9dj/image/upload/v1765401316/Certificado_Bintech_2025_-_ITCA__ponentes-Final_dp7bjq.svg);
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
            padding-top: 3.7cm;
        }

        .participant-name {
            font-family: "KarbonBold", sans-serif !important;
            font-weight: bold;
            font-style: normal;
            color: #004997;
            font-size: 0.75cm;
            margin-top: -0.5cm;
        }

        .participant-cedula {
            font-family: "KarbonSlabStencilRegular", sans-serif !important;
            font-weight: normal;
            font-style: normal;
            color: #004997;
            font-size: 0.55cm;
            margin-top: -1cm;
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
            text-align: center;
        }
        .montserrat-text-2 {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-weight: 400;
            font-size: 0.4cm !important;
            font-style: normal;
            text-align: right;
            margin-top: 1.2cm;
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
            font-family: "KarbonSemiBold", sans-serif;
            font-optical-sizing: auto;
            font-size: 0.55cm !important;
            font-style: normal;
            color: #4159a3;
        }
        .description-bold-center-text {
            font-family: "KarbonSlabStencilRegular", sans-serif;
            font-size: 0.52cm !important;
            text-align: center;
            color: #4159a3;
            margin-top: -0.5cm;
        }
        .description-bold-text {
            font-family: "KarbonSlabStencilRegular", sans-serif;
            font-size: 0.52cm !important;
            text-align: justify;
            color: #4159a3;
        }
        .work-name {
            font-family: "KarbonBold", sans-serif !important;
            font-weight: bold;
            font-style: normal;
            color: #004997;
            font-size: 0.65cm;
            margin-top: -0.3cm;
            margin-bottom: 0.2cm;
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
        .date-bold-text {
            font-family: "KarbonSlabStencilRegular", sans-serif;
            font-size: 0.50cm !important;
            text-align: right;
            color: #4159a3;
            margin-top: -0.4cm;
        }

        .Karbon-bold-text {
            font-family: "KarbonBoldItalic", sans-serif;
            font-optical-sizing: auto;
            font-size: 0.55cm !important;
            font-style: italic;
            color: #4159a3;
            padding-top: 0.1cm;
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
            margin-left: 10.6cm;
            position: absolute;
            width: 55%;
            margin-top: 16.3cm;
        }
        .col2{
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: end;
            margin-left: -0.8cm;
            padding-right: 0.2cm;
            padding-bottom: 0.3cm;
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
            /* border: #28348A solid; */
            height: 100%;
            width: 500px !important;
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

<body style="margin: 0" data-cedula="{{documentID}}">
    <div class="page-background"></div>
    <div class="bodydiv">
        <div class="col0">
        </div>
        <div class="col1">
            <div class="name-participant-section">
                <h1 class="montserrat-bold-text">CONFIEREN EL PRESENTE CERTIFICADO DE PONENTE A:</h1>
                <h1 class="participant-name"><strong>{{name}}</strong></h1>
                <h1 class="participant-cedula"><strong>{{cedula}}</strong></h1>
                <!-- <hr> -->
                <p class="description-bold-text">{{description}}</p>
                <p></p>
                <h1 class="description-bold-text">Su presentación aportó de manera significativa al fortalecimiento y al enriquecimiento del debate científico desarrollado durante el evento.</h1>
                <p class="date-bold-text">{{issuedAt}}</p>
            </div>
        </div>
        <div class="signs-section">
                    <div id="sign-directora">
                        <img id="img-directora" style="height: 3.8cm; margin-left: -0.7cm;" src="https://res.cloudinary.com/dkzhem9dj/image/upload/v1765374420/Dra._Alicia_Soto_smmhsf.svg" alt="director sign">
                    </div>
                    <div id="sign-coordinadora" style="position: relative;">
                        <img style="height: 3.5cm; position: relative; z-index: 1;" src="https://res.cloudinary.com/dkzhem9dj/image/upload/v1765371454/PhD._Nataly_Cadena_v8u1be.svg" alt="director sign">
                    </div>
                </div>
        <div class="col2">
            <a href="{{url-hash}}" class="hash-style" target="_blank" rel="noopener noreferrer">{{transactionHash}}</a>
            <img style="max-width: 2cm;" src="data:image/png;base64,{{transactionHashQRBase64}}" alt="QR code to validate certificate">
        </div>
    </div>
    <!-- Script para darle forma necesitada página -->
    <script>
        function adjustPaddingBasedOnLines() {
            const workNameEl = document.querySelector('.work-name');
            if (!workNameEl) return;

            // Crear un elemento temporal para medir una línea
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.textContent = 'M'; // Carácter de referencia
            
            // Copiar estilos relevantes del elemento original
            const computedStyle = window.getComputedStyle(workNameEl);
            tempSpan.style.fontSize = computedStyle.fontSize;
            tempSpan.style.fontFamily = computedStyle.fontFamily;
            tempSpan.style.fontWeight = computedStyle.fontWeight;
            tempSpan.style.lineHeight = computedStyle.lineHeight;
            
            workNameEl.appendChild(tempSpan);
            const singleLineHeight = tempSpan.offsetHeight;
            workNameEl.removeChild(tempSpan);
            
            // Obtener altura total del elemento
            const elementHeight = workNameEl.scrollHeight;
            
            console.log('Element height:', elementHeight, 'Single line height:', singleLineHeight);
            
            const numberOfLines = Math.round(elementHeight / singleLineHeight);
            console.log('Number of lines detected:', numberOfLines);

            // Configurar padding-top y font-size según número de líneas
            const nameSection = document.querySelector('.name-participant-section');
            if (!nameSection) return;

            let paddingTop;
            let fontSize;
            
            if (numberOfLines <= 1) {
                paddingTop = '4.2cm';
                fontSize = '0.75cm';
            } else if (numberOfLines === 2) {
                paddingTop = '4cm';
                fontSize = '0.70cm';
            } else if (numberOfLines === 3) {
                paddingTop = '3.7cm';
                fontSize = '0.65cm'; // Original
            } else if (numberOfLines === 4) {
                paddingTop = '3.5cm';
                fontSize = '0.65cm';
            } else {
                paddingTop = '3.2cm';
                fontSize = '0.65cm';
            }

            console.log('Applying padding:', paddingTop, 'font-size:', fontSize);
            nameSection.style.paddingTop = paddingTop;
            workNameEl.style.fontSize = fontSize;
        }

        function divideDescriptionAdvanced(text) {
            if (!text) return null;
            const t = text.trim();

            const colonIndex = t.indexOf(':');
            if (colonIndex === -1) return null; // no cumple formato básico

            // Buscar todos los puntos después del colonIndex
            let searchFrom = colonIndex + 1;
            let dotIndex = t.indexOf('.', searchFrom);
            if (dotIndex === -1) return null; // no hay punto tras los dos puntos: no dividimos

            // Intentamos encontrar un punto tal que lo que viene inmediatamente después (trim)
            // comience por la palabra "Presentado" (case-insensitive).
            let candidateDot = -1;
            while (dotIndex !== -1) {
                const after = t.slice(dotIndex + 1).trimStart(); // texto después del punto (sin trim final aún)
                if (after.length > 0) {
                const firstWord = after.split(/\s+/)[0] || "";
                if (firstWord.toLowerCase() === "presentado") {
                    candidateDot = dotIndex;
                    break;
                }
                }
                // continuar buscando siguiente punto
                dotIndex = t.indexOf('.', dotIndex + 1);
            }

            // Si no encontramos un punto seguido por "Presentado", tomar el primer punto posterior al colon
            const finalDotIndex = (candidateDot !== -1) ? candidateDot : t.indexOf('.', searchFrom);

            if (finalDotIndex === -1) return null; // redundante, pero seguro

            const part1 = t.slice(0, colonIndex + 1).trim(); // incluye ':'
            const part2 = t.slice(colonIndex + 1, finalDotIndex).trim(); // título (puede contener puntos)
            const part3 = t.slice(finalDotIndex + 1).trim(); // resto después del punto

            if (!part1 || !part2 || !part3) return null; // si algo queda vacío, no tocar

            return [part1, part2, part3];
            }

    // Reemplazo y lógica de impresión
    window.addEventListener('load', function () {
      const descEl = document.querySelector('.description-bold-text');
      if (!descEl) {
        startPrintConfirm();
        return;
      }

      const originalText = (descEl.textContent || '').trim();
      const parts = divideDescriptionAdvanced(originalText);

      if (parts) {
        const container = document.createElement('div');

        // Parte 1
        const p1 = document.createElement('p');
        p1.className = 'description-bold-center-text';
        p1.innerText = parts[0];
        container.appendChild(p1);

        // separación visual
        container.appendChild(document.createElement('p'));

        // Parte 2: título con clase participant-name y strong
        const p2 = document.createElement('p');
        p2.className = 'work-name';
        const strong = document.createElement('strong');
        strong.innerText = parts[1];
        p2.appendChild(strong);
        container.appendChild(p2);

        // separación visual
        container.appendChild(document.createElement('p'));

        // Parte 3
        const p3 = document.createElement('p');
        p3.className = 'description-bold-text';
        p3.innerText = parts[2];
        container.appendChild(p3);

        descEl.parentNode.replaceChild(container, descEl);
        
        // Usar requestAnimationFrame para asegurar el renderizado
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                adjustPaddingBasedOnLines();
            });
        });
      }
      // si parts es null, no hacemos nada y dejamos el contenido original

      const cedula = document.body.dataset.cedula;
      
      if (cedula === "1002979001") {
        const signCoordinadora = document.getElementById("sign-coordinadora");
        const imgDirectora = document.getElementById("img-directora");

        if (signCoordinadora && imgDirectora) {
            signCoordinadora.style.display = "none";
            imgDirectora.style.marginLeft = "0cm";
        }
        const pageBackground = document.querySelector(".page-background");
        if (pageBackground) {
            pageBackground.style.backgroundImage =
                "url('https://res.cloudinary.com/dkzhem9dj/image/upload/v1767880146/Bintech2025_ITCA_ponentes-CoordinadoraNodo_hppk5m.svg')";
        }
    }

      startPrintConfirm();
    });

    function startPrintConfirm() {
      setTimeout(function () {
        if (confirm('¿Desea imprimir el certificado?')) {
          window.print();
        }
      }, 3000);
    }
    </script>
</body>
</html>
`

export default html_BACKGROUND008