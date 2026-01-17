import React from 'react';
import { Helmet } from 'react-helmet-async';

const LegalPage = () => {
  return (
    <>
      <Helmet>
        <title>Aviso Legal y Políticas de Privacidad - Gallego Productos & servicios SL</title>
        <meta name="description" content="Consulta nuestro aviso legal, política de privacidad y política de cookies." />
      </Helmet>

      <section className="Tab-content">
        <div className="Legal-content">
          
          {/* --- AVISO LEGAL --- */}
          <h2 id="aviso-legal">Aviso Legal</h2>
          <p>En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), GALLEGO PRODUCTOS & SERVICIOS SL informa que es titular del sitio web. De acuerdo con la exigencia del artículo 10 de la citada Ley, informa de los siguientes datos:</p>
          <ul>
            <li><strong>Titular:</strong> GALLEGO PRODUCTOS & SERVICIOS SL</li>
            <li><strong>Dirección:</strong> Calle San Ramon Paiporta, Valencia</li>
            <li><strong>Email de contacto:</strong> gallegoproductosyserviciossl@gmail.com</li>
          </ul>

          <h3>Usuario y régimen de responsabilidades</h3>
          <p>La navegación, acceso y uso por el sitio web de GALLEGO PRODUCTOS & SERVICIOS SL confiere la condición de usuario, por la que se aceptan, desde la navegación por el sitio web, todas las condiciones de uso aquí establecidas sin perjuicio de la aplicación de la correspondiente normativa de obligado cumplimiento legal según el caso.</p>
          <p>El sitio web proporciona gran diversidad de información, servicios y datos. El usuario asume su responsabilidad en el uso correcto del sitio web. Esta responsabilidad se extenderá a la veracidad y licitud de las informaciones aportadas por el usuario en los formularios extendidos para el acceso a ciertos contenidos o servicios ofrecidos por el web.</p>
          
          {/* --- POLÍTICA DE PRIVACIDAD --- */}
          <h2 id="privacidad">Política de Privacidad</h2>
          <p>De conformidad con lo establecido en el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos (RGPD), le informamos de que los datos personales que nos facilite a través del formulario de contacto serán tratados con la finalidad de gestionar su consulta y mantener el contacto profesional.</p>
          <h3>Finalidad del tratamiento de los datos</h3>
          <p>Sus datos personales serán utilizados exclusivamente para las siguientes finalidades:</p>
          <ul>
            <li>Gestionar las consultas o cualquier tipo de petición que sea realizada por el usuario a través de cualquiera de las formas de contacto que se ponen a su disposición.</li>
            <li>Mantener la relación comercial y profesional con nuestros clientes y contactos.</li>
          </ul>
          <h3>Legitimación y conservación</h3>
          <p>La base legal para el tratamiento de sus datos es el consentimiento explícito que nos otorga al aceptar esta política antes de enviar su consulta. Los datos proporcionados se conservarán mientras se mantenga la relación comercial o durante el tiempo necesario para cumplir con las obligaciones legales.</p>
          <h3>Derechos del usuario</h3>
          <p>Usted tiene derecho a obtener confirmación sobre si en GALLEGO PRODUCTOS & SERVICIOS SL estamos tratando sus datos personales, por tanto tiene derecho a acceder a sus datos personales, rectificar los datos inexactos o solicitar su supresión cuando los datos ya no sean necesarios para los fines que fueron recogidos. Podrá ejercer dichos derechos dirigiéndose al email de contacto proporcionado.</p>

          {/* --- POLÍTICA DE COOKIES --- */}
          <h2 id="cookies">Política de Cookies</h2>
          <p>Una cookie es un pequeño fichero de texto que se almacena en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página.</p>
          <h3>Cookies utilizadas en este sitio web</h3>
          <p>Este sitio web utiliza las siguientes cookies:</p>
          <ul>
            <li><strong>Cookies técnicas:</strong> Son aquellas imprescindibles para el funcionamiento de la web. Por ejemplo, las que permiten mantener la sesión de usuario.</li>
            <li><strong>Cookies de personalización:</strong> Permiten al usuario configurar aspectos como el idioma o la configuración regional.</li>
          </ul>
          <p>Este sitio web NO utiliza cookies de terceros con fines analíticos o publicitarios. Los enlaces a redes sociales (WhatsApp, Instagram) pueden instalar cookies de terceros una vez el usuario accede a dichas plataformas.</p>
          <h3>Desactivación o eliminación de cookies</h3>
          <p>En cualquier momento podrá ejercer su derecho de desactivación o eliminación de cookies de este sitio web. Estas acciones se realizan de forma diferente en función del navegador que esté usando. Le recomendamos consultar la ayuda de su navegador para gestionar las cookies.</p>
        </div>
      </section>
    </>
  );
};

export default LegalPage;
