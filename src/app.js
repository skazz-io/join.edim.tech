
function $(id) {
	return document.getElementById(id);
}
function $$(selectors) {
	return document.querySelectorAll(selectors);
}
function $$$(url, callback) {
	var callbackMethod = 'callback_' + new Date().getTime();

	window[callbackMethod] = function (data) {
		delete window[callbackMethod];
		document.body.removeChild(script);
		callback(data);
	}

	var script = document.createElement('script');

	script.src = url + callbackMethod;
	
	try {
		document.body.appendChild(script);
	} catch {
		
	}
}

function app() {
	try { loadImages(); } catch (err) { console.log(err) }
	try { loadParticles(); } catch (err) { console.log(err) }
	try { loadPlanetside(); } catch (err) { console.log(err) }
}

function loadImages() {
	$$('img').forEach(function (tag) {
		var curImg = new Image();

		curImg.onload = function() {
			tag.src = tag.dataset.src;
		}
		
		curImg.src = tag.dataset.src;
	})
}

function loadPlanetside() {
	var url = 'https://census.daybreakgames.com/get/ps2:v2/outfit/?alias_lower=edim&c:resolve=member,member_online_status,member_character&callback=';
	
	var result = $('planetside-result');

	$('ActiveLeaders').innerText = '';
	$('ActiveMembersNow').innerText = '';
	$('ActiveMembersToday').innerText = '';
	$('ActiveMembersWeek').innerText = '';
	$('ActiveMembersMonth').innerText = '';
	$('TotalPrestige').innerText = '';
	$('TotalBattleRank').innerText = '';

    result.classList.remove('error');
    result.classList.add('loading');
	
	$$$(url, function (data) {
		if (!data || !data.outfit_list || data.outfit_list.length == 0) {
			result.classList.add('error');
			result.classList.remove('loading');
			return;
		}
		
		var outfit_list = data.outfit_list[0];
		
		var today = new Date();
		// 8am because people may play past midnight the previous day.
		today.setHours(8,0,0,0);

		var week = new Date();
		week.setHours(0,0,0,0);
		week.setDate(week.getDate() - 7);

		var month = new Date();
		month.setHours(0,0,0,0);
		month.setMonth(month.getMonth() - 1);

		var loginNow = 0;
		var loginToday = 0;
		var loginWeek = 0;
		var loginMonth = 0;

		var totalBR = 0;
		var totalPrestige = 0;
		var averageBR = 0;
		var averageBRc = 0;

		var activeLeaders = 0;

        for (var i = 0; i < outfit_list.members.length; i++)
        {
            var member = outfit_list.members[i];

			if (member['online_status'] == '1') {
				loginNow++;
			}

			var times = member['times'];

			if (times) {
				var lastLoginTime = times['last_login'];

				if (lastLoginTime) {
					// unix timestamp
					var lastLogin = new Date(lastLoginTime*1000);

					if (lastLogin > today) {
						loginToday++;
					}
					
					if (lastLogin > week) {
						loginWeek++;
					}
					
					if (lastLogin > month) {
						loginMonth++;

						if (member['rank_ordinal_merged'] < 3) {
							activeLeaders++;
						}
					}
				}
			}
			
			if (member['prestige_level']) {
				totalPrestige += member['prestige_level']*1;
			}

			if (member['battle_rank'] && member['battle_rank']['value']) {
				// probably need to add prestige_level*100
				totalBR += member['battle_rank']['value']*1;
				
				if (member['prestige_level']) {
					averageBR += member['battle_rank']['value']*1;
					averageBR += member['prestige_level']*125;
					averageBRc += 1;
				}

			}
		}

		$('ActiveLeaders').innerText = activeLeaders;
		$('ActiveMembersNow').innerText = loginNow;
		$('ActiveMembersToday').innerText = loginToday;
		$('ActiveMembersWeek').innerText = loginWeek;
		$('ActiveMembersMonth').innerText = loginMonth;
		$('TotalMembers').innerText = averageBRc;
		$('TotalPrestige').innerText = totalPrestige;
		$('TotalBattleRank').innerText = totalBR;
		$('AvgBattleRank').innerText = Math.round((averageBR / averageBRc)*100)/100;
	
		result.classList.remove('loading');
	});
}

function loadParticles() {
	particlesJS('particles-js', {
		"particles": {
			"number": {
				"value": 80,
				"density": {
					"enable": true,
					"value_area": 800
				}
			},
			"color": {
				"value": "#00A9A3"
			},
			"shape": {
				"type": "circle",
				"stroke": {
					"width": 0,
					"color": "#000000"
				},
				"polygon": {
					"nb_sides": 5
				},
				"image": {
					"src": "img/github.svg",
					"width": 100,
					"height": 100
				}
			},
			"opacity": {
				"value": 0.5,
				"random": false,
				"anim": {
					"enable": false,
					"speed": 1,
					"opacity_min": 0.1,
					"sync": false
				}
			},
			"size": {
				"value": 5,
				"random": true,
				"anim": {
					"enable": false,
					"speed": 40,
					"size_min": 0.1,
					"sync": false
				}
			},
			"line_linked": {
				"enable": true,
				"distance": 150,
				"color": "#00A9A3",
				"opacity": 0.4,
				"width": 1
			},
			"move": {
				"enable": true,
				"speed": 6,
				"direction": "none",
				"random": false,
				"straight": false,
				"out_mode": "out",
				"attract": {
					"enable": false,
					"rotateX": 600,
					"rotateY": 1200
				}
			}
		},
		"interactivity": {
			"detect_on": "canvas",
			"events": {
				"onhover": {
					"enable": true,
					"mode": "repulse"
				},
				"onclick": {
					"enable": true,
					"mode": "push"
				},
				"resize": true
			},
			"modes": {
				"grab": {
					"distance": 400,
					"line_linked": {
						"opacity": 1
					}
				},
				"bubble": {
					"distance": 400,
					"size": 40,
					"duration": 2,
					"opacity": 8,
					"speed": 3
				},
				"repulse": {
					"distance": 50
				},
				"push": {
					"particles_nb": 4
				},
				"remove": {
					"particles_nb": 2
				}
			}
		},
		"retina_detect": true,
		"config_demo": {
			"hide_card": false,
			"background_color": "#b61924",
			"background_image": "",
			"background_position": "50% 50%",
			"background_repeat": "no-repeat",
			"background_size": "cover"
		}
	}
	);
}

this.addEventListener('load', app);
