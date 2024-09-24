import Logofingara from '../../images/logo-fingara.png';

export default function ApplicationLogo({ height = '50px', width = '50px', ...props }) {
    return (
        <img
            {...props}
            src={Logofingara}
            alt="Fingara Logo"
            style={{ height: height, width: width }} // Inline style for dynamic height and width
        />
    );
}
