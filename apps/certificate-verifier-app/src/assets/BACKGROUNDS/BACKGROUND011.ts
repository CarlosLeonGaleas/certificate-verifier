import { KARBON_SEMIBOLD, KARBON_BOLD, KARBON_BOLD_ITALIC, KARBON_MEDIUM, KARBON_REGULAR } from '../../constants/fonts';
const html_BACKGROUND011 = `
<!DOCTYPE html>
<html style="-webkit-print-color-adjust: exact; margin: 0; padding: 0;">
<head>
    <title>{{web-title}}</title>
    <link rel="icon" href="https://res.cloudinary.com/dvjnqwzpc/image/upload/v1720111589/blockchain-webpage/cerif-logo_xkfm37.ico" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Playball&display=swap" rel="stylesheet">
    <style>
        @font-face {
            font-family: "KarbonSemiBold";
            src: url("${KARBON_SEMIBOLD}") format("opentype");
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: "KarbonBold";
            src: url("${KARBON_BOLD}") format("opentype");
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: "KarbonBoldItalic";
            src: url("${KARBON_BOLD_ITALIC}") format("opentype");
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: "KarbonSlabStencilRegular";
            src: url("${KARBON_MEDIUM}") format("opentype");
            font-weight: bold;
        }
        @font-face {
            font-family: "KarbonRegular";
            src: url("${KARBON_REGULAR}") format("opentype");
            font-weight: normal;
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

        @page {
            size: A4 landscape;
            margin: 0;
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
            background: white url(https://res.cloudinary.com/dkzhem9dj/image/upload/v1776894026/CertificadoAutor-ITCAeditorial_nxrfbx.svg) fixed no-repeat;
            background-size: cover;
        }

        /* ── Columnas ── */
        .col0 {
            height: 100%;
            width: 280px !important;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: end;
        }

        .col1 {
            width: 100%;
        }

        .col2 {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: end;
            margin-left: -0.8cm;
            padding-right: 0.2cm;
            padding-bottom: 3.9cm;
            margin-top: 6cm;
            width: 100px !important;
        }

        /* ── Sección participante ── */
        .name-participant-section {
            margin-left: 4.8cm;
            padding-top: 6.6cm;
            width: 57%;
        }

        .participant-name {
            font-family: "KarbonBold", sans-serif !important;
            font-weight: bold;
            font-style: italic;
            color: #1d1d1b;
            font-size: 0.75cm;
            margin-top: -0.5cm;
        }

        .participant-cedula {
            font-family: "KarbonRegular", sans-serif !important;
            font-weight: normal;
            font-style: normal;
            color: #1d1d1b;
            font-size: 0.6cm;
            margin-top: -0.8cm;
        }

        /* ── Textos de descripción (algunos inyectados por JS) ── */
        .description-bold-text {
            font-family: "KarbonRegular", sans-serif;
            font-size: 0.485cm !important;
            text-align: justify;
            color: #010000;
        }

        .description-bold-center-text {
            font-family: "KarbonSlabStencilRegular", sans-serif;
            font-size: 0.53cm !important;
            text-align: center;
            color: #86bc26;
            margin-top: -0.5cm;
        }

        .work-name {
            font-family: "KarbonSlabStencilRegular", sans-serif !important;
            font-style: normal;
            color: #004997;
            font-size: 0.58cm;
            margin-top: -0.3cm;
            margin-bottom: 0.2cm;
            line-height: 98%;
        }

        .date-bold-text {
            font-family: "KarbonRegular", sans-serif;
            font-size: 0.48cm !important;
            text-align: right;
            color: #010000;
        }

        /* ── Firmas ── */
        .signs-section {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            margin-top: 15.8cm;
            margin-left: 8.8cm;
            position: absolute;
            width: 55%;
        }

        .nombre-firmante {
            font-family: "KarbonSlabStencilRegular", sans-serif !important;
            font-size: 9pt;
            color: #3c3c3b;
        }

        .rol-firmante {
            font-family: "KarbonBold", sans-serif !important;
            font-size: 8pt;
            color: #3c3c3b;
        }

        #firmante1 {
            margin-top: -0.4cm;
            margin-left: -0.48cm;
        }

        #firmante2 {
            margin-top: -0.25cm;
            margin-left: 0.3cm;
        }

        #rol-firmante1 {
            margin-top: -0.32cm;
            margin-left: -0.35cm;
        }

        #rol-firmante2 {
            margin-top: -0.32cm;
            margin-left: 0.3cm;
        }

        /* ── QR / hash ── */
        .hash-style {
            font-size: 0.27cm;
            text-decoration: none;
            color: black;
            text-orientation: sideways;
            writing-mode: vertical-lr;
            align-self: flex-end;
            margin-bottom: 0.2cm;
            padding-right: 0.2cm;
            margin-top: -4cm;
        }

        h1 {
            font-size: 1cm;
            margin-bottom: 1cm;
        }

        p {
            font-size: .5cm;
        }
    </style>
</head>

<body style="margin: 0">
    <div class="page-background"></div>
    <div class="bodydiv">
        <div class="col0"></div>
        <div class="col1">
            <div class="name-participant-section">
                <h1 class="participant-name"><strong>{{name}}</strong></h1>
                <h1 class="participant-cedula"><strong>{{cedula}}</strong></h1>
                <p class="description-bold-text">{{description}}</p>
                <p></p>
                <p class="description-bold-text" id="contribucion">Se reconoce su contribución intelectual, originalidad y compromiso con la producción de conocimiento destacando el valor de su trabajo en el fortalecimiento de la investigación y la divulgación académica.</p>
                <p class="date-bold-text">{{issuedAt}}</p>
            </div>
        </div>
        <div class="signs-section">
            <div>
                <img id="firma-firmante1" style="width: 4.7cm;" src="https://res.cloudinary.com/dkzhem9dj/image/upload/v1765371454/PhD._Nataly_Cadena_v8u1be.svg" alt="Editor General">
                <p id="firmante1" class="nombre-firmante">Ph.D. Nataly Cadena</p>
                <p id="rol-firmante1" class="rol-firmante">Editora General</p>
            </div>
            <div style="position: relative; display: inline-block;">
                <img id="firma-firmante2" style="width: 4.7cm; padding-top: 0.7cm" src="https://res.cloudinary.com/dkzhem9dj/image/upload/v1781039519/FIRMA_FABRICIO_HIDALGO_vj8sp9.png" alt="Editor Académico">
                <p id="firmante2" class="nombre-firmante">Mgs. Fabricio Hidalgo</p>
                <p id="rol-firmante2" class="rol-firmante">Editor Académico</p>
            </div>
        </div>
        <div class="col2">
            <a href="{{url-hash}}" class="hash-style" target="_blank" rel="noopener noreferrer">{{transactionHash}}</a>
            <img style="max-width: 2cm;" src="data:image/png;base64,{{transactionHashQRBase64}}" alt="QR code to validate certificate">
        </div>
    </div>

    <script>
        function adjustPaddingBasedOnLines_BACK011() {
            const workNameEl = document.querySelector('.work-name');
            if (!workNameEl) return;

            const tempSpan = document.createElement('span');
            tempSpan.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap';
            tempSpan.textContent = 'M';

            const cs = window.getComputedStyle(workNameEl);
            tempSpan.style.fontSize   = cs.fontSize;
            tempSpan.style.fontFamily = cs.fontFamily;
            tempSpan.style.fontWeight = cs.fontWeight;
            tempSpan.style.lineHeight = cs.lineHeight;

            workNameEl.appendChild(tempSpan);
            const singleLineHeight = tempSpan.offsetHeight;
            workNameEl.removeChild(tempSpan);

            const numberOfLines = Math.round(workNameEl.scrollHeight / singleLineHeight);

            const nameSection = document.querySelector('.name-participant-section');
            if (!nameSection) return;

            nameSection.style.paddingTop = '6.6cm';
            workNameEl.style.fontSize = numberOfLines <= 2 ? '0.58cm' : '0.55cm';
        }
        
        function adjustPaddingBasedOnLines_BACK012() {
            const workNameEl = document.querySelector('.work-name');
            if (!workNameEl) return;

            const tempSpan = document.createElement('span');
            tempSpan.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap';
            tempSpan.textContent = 'M';

            const cs = window.getComputedStyle(workNameEl);
            tempSpan.style.fontSize   = cs.fontSize;
            tempSpan.style.fontFamily = cs.fontFamily;
            tempSpan.style.fontWeight = cs.fontWeight;
            tempSpan.style.lineHeight = cs.lineHeight;

            workNameEl.appendChild(tempSpan);
            const singleLineHeight = tempSpan.offsetHeight;
            workNameEl.removeChild(tempSpan);

            const numberOfLines = Math.round(workNameEl.scrollHeight / singleLineHeight);

            const nameSection = document.querySelector('.name-participant-section');
            if (!nameSection) return;

            nameSection.style.paddingTop = numberOfLines <= 2 ? '8.2cm' :'8cm';
            document.querySelector('.description-bold-center-text').style.marginTop = '-0.3cm';
            workNameEl.style.fontSize = numberOfLines <= 2 ? '0.58cm' : '0.55cm';
            workNameEl.style.marginTop = numberOfLines <= 2 ? '1cm' : '0.8cm';
            workNameEl.style.marginBottom = numberOfLines <= 2 ? '0.8cm' : '0.6cm';
            document.querySelector('#contribucion').style.display = 'none';
        }

        function divideDescription_BACKGROUND011(text) {
            if (!text) return null;
            const t = text.trim();

            const colonIndex = t.indexOf(':');
            if (colonIndex === -1) return null;

            let dotIndex = t.indexOf('.', colonIndex + 1);
            if (dotIndex === -1) return null;

            let candidateDot = -1;
            while (dotIndex !== -1) {
                const after = t.slice(dotIndex + 1).trimStart();
                if (after.length > 0 && (after.split(/\s+/)[0] || '').toLowerCase() === 'la cual') {
                    candidateDot = dotIndex;
                    break;
                }
                dotIndex = t.indexOf('.', dotIndex + 1);
            }

            const finalDotIndex = candidateDot !== -1 ? candidateDot : t.indexOf('.', colonIndex + 1);
            if (finalDotIndex === -1) return null;

            const part1 = t.slice(0, colonIndex + 1).trim();
            const part2 = t.slice(colonIndex + 1, finalDotIndex).trim();
            const part3 = t.slice(finalDotIndex + 1).trim();

            return (part1 && part2 && part3) ? [part1, part2, part3] : null;
        }
        
        function divideDescription_BACKGROUND012(text) {
            if (!text) return null;

            const t = text.trim();
            const colonIndex = t.indexOf(':');

            if (colonIndex === -1) return null;

            const part1 = t.slice(0, colonIndex + 1).trim();

            let part2 = t.slice(colonIndex + 1).trim();

            // Eliminar punto final si existe
            if (part2.endsWith('.')) {
                part2 = part2.slice(0, -1).trim();
            }

            return (part1 && part2) ? [part1, part2] : null;
        }

        function applySignerOverrides() {
            const cedula = document.querySelector('.participant-cedula')?.textContent?.trim();

            if (cedula === '1711718930') {
                document.querySelector('#firma-firmante2').src       = 'https://res.cloudinary.com/dkzhem9dj/image/upload/v1781105869/MSc_Eric_Guerra_jxjxa0.svg';
                document.querySelector('#firma-firmante2').style.paddingTop = '0.9cm';
                document.querySelector('#firmante2').textContent     = 'MSc. Eric Guerra';
                document.querySelector('#firmante2').style.marginTop      = '0.25cm';
            } else if (cedula === '1002979001') {
                document.querySelector('#firma-firmante1').src       = 'https://res.cloudinary.com/dkzhem9dj/image/upload/v1781105869/MSc_Eric_Guerra_jxjxa0.svg';
                document.querySelector('#firma-firmante1').style.paddingTop = '0.9cm';
                document.querySelector('#firmante1').textContent     = 'MSc. Eric Guerra';
                document.querySelector('#firmante1').style.marginTop      = '0.28cm';
                document.querySelector('#rol-firmante1').textContent = 'Editor Académico';
            }
        }

        window.addEventListener('load', function () {
            applySignerOverrides();
            const BACKGROUND = "{{BACKGROUND}}";

            const descEl = document.querySelector('.description-bold-text');
            if (!descEl) { startPrintConfirm(); return; }

            let parts = '';

            if (BACKGROUND === "BACKGROUND011"){
                parts = divideDescription_BACKGROUND011((descEl.textContent || '').trim());
            } else {
                parts = divideDescription_BACKGROUND012((descEl.textContent || '').trim());
            }

            if (parts) {
                const container = document.createElement('div');

                const p1 = document.createElement('p');
                p1.className = 'description-bold-center-text';
                p1.innerText = parts[0];
                container.appendChild(p1);

                container.appendChild(document.createElement('p'));

                const p2 = document.createElement('p');
                p2.className = 'work-name';
                const strong = document.createElement('strong');
                strong.innerText = parts[1];
                p2.appendChild(strong);
                container.appendChild(p2);

                if (BACKGROUND === "BACKGROUND011"){
                    container.appendChild(document.createElement('p'));
    
                    const p3 = document.createElement('p');
                    p3.className = 'description-bold-text';
                    p3.innerText = parts[2];
                    container.appendChild(p3);
                    descEl.parentNode.replaceChild(container, descEl);
                    requestAnimationFrame(() => requestAnimationFrame(adjustPaddingBasedOnLines_BACK011));
                }else{
                    descEl.parentNode.replaceChild(container, descEl);
                    requestAnimationFrame(() => requestAnimationFrame(adjustPaddingBasedOnLines_BACK012));
                }

                
                
                if (BACKGROUND === "BACKGROUND012"){
                    document.querySelector('.name-participant-section').style.paddingTop = '8.2cm';
                    document.querySelector('#contribucion').style.display = 'none';
                }
            }
        });
    </script>
</body>
</html>
`
export default html_BACKGROUND011