export const ErrorCode = {
	SYSTEM_ERROR: { code: 'SYSTEM_ERROR', label: 'Sedang terjadi masalah, silakan coba kembali. Atau hubungi CS' },
	UNAUTHORIZED: { code: 'UNAUTHORIZED', label: 'Unauthorized' },
	INVALID_JSON: { code: 'INVALID_JSON', label: 'Invalid JSON format' },
	VALIDATION_ERROR: { code: 'VALIDATION_ERROR', label: 'Validation Error' },
	IP_NOT_ALLOWED: { code: 'IP_NOT_ALLOWED', label: 'IP address not allowed.' },
	OTP_REQUIRED:{code: 'OTP_REQUIRED', label: 'OTP dibutuhkan!'},
	OTP_TIMEOUT:{code: 'OTP_TIMEOUT', label: 'Mohon maaf! nomor kamu harus menunggu 3 menit sebelum dapat mengirim permintaan otp!'},
	OTP_BANNED:{code: 'OTP_BANNED', label: 'Mohon maaf, nomor kamu untuk sementara tidak dapat melakukan proses OTP. Silakan coba beberapa saat lagi!'},
	OTP_MAX_RETRY:{code: 'OTP_MAX_RETRY', label: 'Mohon maaf, untuk keamanan akun untuk sementara kamu tidak dapat melakukan proses OTP. Silakan coba beberapa saat lagi!'},
	OTP_INVALID:{code: 'OTP_INVALID', label: 'Kode OTP salah!'},
};
