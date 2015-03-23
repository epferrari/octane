<?
$host="localhost"; // Host name 
$username="onefire_dealer"; // Mysql username 
$password="1Firemedia!"; // Mysql password 
$db_name="onefire_catdealers"; // Database name 
$tbl_name="jobs"; // Table name

// Connect to server and select databse.
mysql_connect("$host", "$username", "$password") or die(mysql_error());
mysql_select_db("$db_name") or die(mysql_error());

function convert_state($name, $to='name') {
		$states = array(
			array('name'=>'Alabama', 'abbrev'=>'AL'),
			array('name'=>'Alaska', 'abbrev'=>'AK'),
			array('name'=>'Arizona', 'abbrev'=>'AZ'),
			array('name'=>'Arkansas', 'abbrev'=>'AR'),
			array('name'=>'California', 'abbrev'=>'CA'),
			array('name'=>'Colorado', 'abbrev'=>'CO'),
			array('name'=>'Connecticut', 'abbrev'=>'CT'),
			array('name'=>'Delaware', 'abbrev'=>'DE'),
			array('name'=>'Florida', 'abbrev'=>'FL'),
			array('name'=>'Georgia', 'abbrev'=>'GA'),
			array('name'=>'Hawaii', 'abbrev'=>'HI'),
			array('name'=>'Idaho', 'abbrev'=>'ID'),
			array('name'=>'Illinois', 'abbrev'=>'IL'),
			array('name'=>'Indiana', 'abbrev'=>'IN'),
			array('name'=>'Iowa', 'abbrev'=>'IA'),
			array('name'=>'Kansas', 'abbrev'=>'KS'),
			array('name'=>'Kentucky', 'abbrev'=>'KY'),
			array('name'=>'Louisiana', 'abbrev'=>'LA'),
			array('name'=>'Maine', 'abbrev'=>'ME'),
			array('name'=>'Maryland', 'abbrev'=>'MD'),
			array('name'=>'Massachusetts', 'abbrev'=>'MA'),
			array('name'=>'Michigan', 'abbrev'=>'MI'),
			array('name'=>'Minnesota', 'abbrev'=>'MN'),
			array('name'=>'Mississippi', 'abbrev'=>'MS'),
			array('name'=>'Missouri', 'abbrev'=>'MO'),
			array('name'=>'Montana', 'abbrev'=>'MT'),
			array('name'=>'Nebraska', 'abbrev'=>'NE'),
			array('name'=>'Nevada', 'abbrev'=>'NV'),
			array('name'=>'New Hampshire', 'abbrev'=>'NH'),
			array('name'=>'New Jersey', 'abbrev'=>'NJ'),
			array('name'=>'New Mexico', 'abbrev'=>'NM'),
			array('name'=>'New York', 'abbrev'=>'NY'),
			array('name'=>'North Carolina', 'abbrev'=>'NC'),
			array('name'=>'North Dakota', 'abbrev'=>'ND'),
			array('name'=>'Ohio', 'abbrev'=>'OH'),
			array('name'=>'Oklahoma', 'abbrev'=>'OK'),
			array('name'=>'Oregon', 'abbrev'=>'OR'),
			array('name'=>'Pennsylvania', 'abbrev'=>'PA'),
			array('name'=>'Rhode Island', 'abbrev'=>'RI'),
			array('name'=>'South Carolina', 'abbrev'=>'SC'),
			array('name'=>'South Dakota', 'abbrev'=>'SD'),
			array('name'=>'Tennessee', 'abbrev'=>'TN'),
			array('name'=>'Texas', 'abbrev'=>'TX'),
			array('name'=>'Utah', 'abbrev'=>'UT'),
			array('name'=>'Vermont', 'abbrev'=>'VT'),
			array('name'=>'Virginia', 'abbrev'=>'VA'),
			array('name'=>'Washington', 'abbrev'=>'WA'),
			array('name'=>'West Virginia', 'abbrev'=>'WV'),
			array('name'=>'Wisconsin', 'abbrev'=>'WI'),
			array('name'=>'Wyoming', 'abbrev'=>'WY'),
			array('name'=>'Alberta', 'abbrev'=>'AB'),
			array('name'=>'British Columbia', 'abbrev'=>'BC'),
			array('name'=>'Manitoba', 'abbrev'=>'MB'),
			array('name'=>'New Brunswick', 'abbrev'=>'NB'),
			array('name'=>'Newfoundland', 'abbrev'=>'NL'),
			array('name'=>'Nova Scotia', 'abbrev'=>'NS'),
			array('name'=>'Northwest Territories', 'abbrev'=>'NT'),
			array('name'=>'Nunavut', 'abbrev'=>'NU'),
			array('name'=>'Ontario', 'abbrev'=>'ON'),
			array('name'=>'Prince Edward Island', 'abbrev'=>'PE'),
			array('name'=>'Quebec', 'abbrev'=>'QC'),
			array('name'=>'Saskatchewan', 'abbrev'=>'SK'),
			array('name'=>'Yukon', 'abbrev'=>'YT')
		);

		$return = false;
		foreach ($states as $state) {
			if ($to == 'name') {
				if (strtolower($state['abbrev']) == strtolower($name)){
					$return = $state['name'];
					break;
				}
			} else if ($to == 'abbrev') {
				if (strtolower($state['name']) == strtolower($name)){
					$return = strtoupper($state['abbrev']);
					break;
				}
			}
		}
		return $return;
	}
	
	$sql = "SELECT DISTINCT state FROM jobs WHERE active = '1' ORDER BY state asc";
	$result = mysql_query($sql);
?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="styles.css" type="text/css">
<title>Sort By Location</title>
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
<script type="text/javascript">
function getUserLocation() {
	//check if the geolocation object is supported, if so get position
	if (navigator.geolocation)
		navigator.geolocation.getCurrentPosition(displayLocation, displayError);
	}
function displayLocation(position) { 
	//display the string for demonstration
		window.location.href='listinggeo.php?lat=' + position.coords.latitude + "&long=" + position.coords.longitude;
	}
function displayError(error) { 

	//find out which error we have, output message accordingly
	switch(error.code) {
	case error.PERMISSION_DENIED:
		alert("Permission was denied");
		break;
	case error.POSITION_UNAVAILABLE:
		alert("Location data not available");
		break;
	case error.TIMEOUT:
		alert("Location request timeout");
		break;
	case error.UNKNOWN_ERROR:
		alert("An unspecified error occurred");
		break;
	default:
		alert("Who knows what happened...");
		break;
	}}
</script>
<script>
if( /Android/i.test(navigator.userAgent) ) {
	$('#state').addClass('android');
}
</script>
</head>
<body style="margin: 0;">
	<div class="content">
	<br />
		<form method="GET" action="search.php">
		
		<div class="purelycss_elegance_button color_yellow size_large align_full search">
				<input type=search placeholder="Search For Jobs" name="search"><a href="jobs.html" class="search">&nbsp;</a>
		</div>
		</form>
		<a href="javascript:getUserLocation();" type="button" class="purelycss_elegance_button color_yellow size_large align_full geolocation" value="" >Use Current Location</a>
		
		<? while($row=mysql_fetch_array($result)){ 
			$state = $row['state'];
			$newState = convert_state($state); 
			if($newState == 'North Carolina'){
				$newState = 'N Carolina';
			} if ($newState == 'South Carolina'){
				$newState = 'S Carolina';
			}
		?>
			<a href="city.php?state=<? echo $state; ?>" id="state" type="button" class="purelycss_elegance_button color_yellow size_large align_full <? echo $newState; ?>" value="" ><? echo $newState; ?></a>
		<? } ?>
			
	</div>
</body>
</html>


