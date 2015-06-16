h3. Background

We don't want search nginx bot to index the page with queries like ?sort or ?gender or ?page in catalog page.

h3. Steps to reproduce

Go to view-source: http://www.zalora.co.id/women/tas/hand-bags/tolliver/special-price/?rating=2-5&sort=popularity&dir=desc
or http://www.zalora.com.ph/women/special-price/triumph/?gender=women&size=MA%2085&sort=popularity&dir=desc

Search for <meta name="robots" content=" in source code

h3. Found
<meta name="robots" content="index,follow" />

h3. Expected
<meta name="robots" content="noindex,follow" />

h3. QA notes

h3. Example
 1. http://www.zalora.co.id/women/sports/pakaian-renang?sort=popularity&dir=desc
2. http://www.zalora.co.id/women/tas/hand-bags/grandir/special-price/?sort=popularity&dir=asc
3. http://www.zalora.co.id/women/tas/hand-bags/tolliver/special-price/?rating=2-5&sort=popularity&dir=desc
4. http://www.zalora.co.id/men/pakaian/batik/ozzy-batik/new-products/?size=M&sort=popularity&dir=desc
5. http://www.zalora.co.id/women/ripcurl/?gender=women&sort=brand&dir=asc

