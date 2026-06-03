import React from 'react';

const Homepage: React.FC = () => {
const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}');
const userName = authData?.state?.user?.name || 'Pengguna';
return (
<div className="p-4">
<h1 className="text-2xl font-bold mb-4">Selamat Datang, {userName}</h1>
</div>);
};

export default Homepage;