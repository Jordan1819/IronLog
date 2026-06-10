export default function PrivacyPolicy() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}
        >
            <div className="card">
                <h1
                    style={{
                        textAlign: 'center',
                    }}
                    >Privacy Policy</h1>
                <br></br>
                <p>
                    IronLog collects and stores your email address and account password
                    for authentication and account management.
                </p>
                <br></br>
                <p>
                    Workout and personal data entered by users is stored securely, is not
                    sold or distributed, and used only to provide the application's functionality.
                </p>
                <br></br>
                <p>
                    Users may delete their account and associated data at any time.
                </p>
            </div>
        </div>
    )
}