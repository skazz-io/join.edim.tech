
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
	var opts = '{"particles":{"number":{"value":80,"density":{"enable":true,"value_area":800}},"color":{"value":"#00A9A3"},"shape":{"type":"circle","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.5,"random":false,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":5,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":true,"distance":150,"color":"#00A9A3","opacity":0.4,"width":1},"move":{"enable":true,"speed":6,"direction":"none","random":false,"straight":false,"out_mode":"out","attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":true,"mode":"repulse"},"onclick":{"enable":true,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},"repulse":{"distance":50},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true,"config_demo":{"hide_card":false,"background_color":"#b61924","background_image":"","background_position":"50% 50%","background_repeat":"no-repeat","background_size":"cover"}}'

	particlesJS('particles-js',	JSON.parse(opts));
}

function memberlistSubmit() {
    var outfitalias = $('outfitalias').value;

    var url = 'https://census.daybreakgames.com/get/ps2:v2/outfit/?alias_lower=' 
        + outfitalias.toLowerCase().trim()
        + '&c:resolve=member,member_online_status,member_character&callback=';

	$('footer').style.display = '';
    $('memberlist_results').style.display = 'none';
    $('footer_loading').style.display = '';

    $$$(url, function (data) {
        var memberResults = $('member-results');
    
        memberResults.innerHTML = '';

        if (data.outfit_list.length == 0)
        {
            var h2 = document.createElement("h2");
            h2.innerText = "Outfit not found";
            result.appendChild(h2);

            $('footer_loading').style.display = 'none';
            $('memberlist_results').style.display = '';
            return;
        }

        var outfit_list = data.outfit_list[0];
		
		var today = new Date();
		// 6am because people may play past midnight the previous day.
		today.setHours(6,0,0,0);

		var week = new Date();
		week.setHours(0,0,0,0);
		week.setDate(week.getDate() - 7);

		var month = new Date();
		month.setHours(0,0,0,0);
        month.setMonth(month.getMonth() - 1);
        
        var ranks = {
            //'Immersed': { 'ordinal': 0, 'total': 0, 'activeNow': 0, 'activeToday': 0, 'activeWeek': 0, 'activeMonth': 0, 
           //     'totalBattleRank': 0, 'totalPrestige': 0 }
        }

        for (var i = 0; i < outfit_list.members.length; i++)
        {
            var member = outfit_list.members[i];

            if (!member['rank']) {
                continue;
            }

            var rankName = member['rank'];

            if (!ranks[rankName]) {
                ranks[rankName] = {
                    'ordinal': member['rank_ordinal_merged'],
                    'total': 0,
                    'activeNow': 0,
                    'activeToday': 0,
                    'activeWeek': 0,
                    'activeMonth': 0, 
                    'totalBattleRank': 0,
                    'totalPrestige': 0
                }
            }
            
            var rank = ranks[rankName];

            rank['total']++;

			if (member['online_status'] == '1') {
				rank['activeNow']++;
			}

			var times = member['times'];

			if (times) {
				var lastLoginTime = times['last_login'];

				if (lastLoginTime) {
					// unix timestamp
					var lastLogin = new Date(lastLoginTime*1000);

					if (lastLogin > today) {
                        rank['activeToday']++;
					}
					
					if (lastLogin > week) {
                        rank['activeWeek']++;
					}
					
					if (lastLogin > month) {
                        rank['activeMonth']++;
					}
				}
			}
			
			if (member['prestige_level']) {
				rank['totalPrestige'] += member['prestige_level']*1;
			}

			if (member['battle_rank'] && member['battle_rank']['value']) {
				// probably need to add prestige_level*125
				rank['totalBattleRank'] += member['battle_rank']['value']*1;
            }
            
            //{
                var tr = document.createElement('tr');

                var td = document.createElement('td');
                if (member.name) td.innerText = member.name.first;
                tr.appendChild(td);

                td = document.createElement('td');
                if (member.battle_rank && member.battle_rank.value && member.prestige_level)
                {
                    td.innerText = member.battle_rank.value + ' (' + member.prestige_level + ')';
                    td.dataset.value = Number(member.battle_rank.value) + (Number(member.prestige_level) * 1000);
                }
                tr.appendChild(td);

                td = document.createElement('td');
                if (member.rank)
                {
                    td.innerText = member.rank;
                    td.dataset.value = member.rank_ordinal;
                }
                tr.appendChild(td);

                td = document.createElement('td');
                if (member.member_since_date) td.innerText = member.member_since_date.substring(0, 10);
                tr.appendChild(td);

                td = document.createElement('td');
                if (member.times && member.times.last_login_date) td.innerText = member.times.last_login_date.substring(0, 10);
                tr.appendChild(td);
                
                memberResults.appendChild(tr);
            //}
        }

        $('outfit-name').innerText = outfit_list['name'];
        $('outfit-created').innerText = outfit_list['time_created_date'];
        $('outfit-members').innerText = outfit_list['member_count'];
        
        var rankTotal = {
            'ordinal': '',
            'total': 0,
            'activeNow': 0,
            'activeToday': 0,
            'activeWeek': 0,
            'activeMonth': 0, 
            'totalBattleRank': 0,
            'totalPrestige': 0
        }

        var rankResults = $('rank-results');
        rankResults.innerHTML = '';

        for (var r in ranks) {
            var rank = ranks[r];

            var tr = document.createElement('tr');

            var td1 = document.createElement('td');
            td1.innerText = r;
            tr.appendChild(td1);

            for (var i in rank) {
                var td = document.createElement('td');
                td.innerText = rank[i];
                tr.appendChild(td);

                if (rank[i] != '') {
                    rankTotal[i] += rank[i];
                }
            }
            
            rankResults.appendChild(tr);
        }

        $('outfit-active-now').innerText = rankTotal['activeNow'];
        $('outfit-active-today').innerText = rankTotal['activeToday'];
        $('outfit-active-week').innerText = rankTotal['activeWeek'];
        $('outfit-active-month').innerText = rankTotal['activeMonth'];
        $('outfit-total-battlerank').innerText = rankTotal['totalBattleRank'];
        $('outfit-total-prestige').innerText = rankTotal['totalPrestige'];
        $('outfit-average-prestige').innerText = Math.round((rankTotal['totalPrestige'] / outfit_list['member_count'])*100)/100;
        $('outfit-average-battlerank').innerText = Math.round((rankTotal['totalBattleRank'] / outfit_list['member_count'])*100)/100;

        sort($('ranksort1'), 1);
        sort($('membersort3'), 3);
        sort($('membersort2'), 2);
        
        $('footer_loading').style.display = 'none';
        $('memberlist_results').style.display = '';
    });

    return false;
}


function userdetailSubmit()
{
    var username = $('username').value;

    var url = "https://census.daybreakgames.com/get/ps2:v2/character/?name.first_lower=" 
        + username.toLowerCase().trim() + "&c:resolve=item_full(name.en,description.en)&callback=";

    $('userdetail_results').style.display = 'none';
    $('footer_loading').style.display = '';
	$('footer').style.display = '';

    $$$(url, function (data) {    
        if (data.character_list.length == 0) {
            $('footer_loading').style.display = 'none';
            $('error_results').style.display = '';
            return;
        }

        var character = data.character_list[0];

        $('userdetail-name').innerText = character.name.first;
        $('userdetail-rank').innerText = character.battle_rank.value + '.' + character.battle_rank.percent_to_next;
        $('userdetail-creation').innerText = character.times.creation_date;
        $('userdetail-lastlogon').innerText = character.times.last_login_date;
        $('userdetail-lastsave').innerText = character.times.last_save_date;
        $('userdetail-totalitems').innerText = character.items.length;

        var items = character.items;

        $('userdetail_loadout').innerHTML = '';

        for (var rank in config.ranks)
        {
            var contain = document.createElement("div");
            $('userdetail_loadout').appendChild(contain);

            var h3 = document.createElement("h3");
            h3.innerText = rank;
            contain.appendChild(h3);

            var ul;
            var section;

            for (var index in config.ranks[rank])
            {
                var skill = config.ranks[rank][index];

                if (skill.section != section)
                {
                    section = skill.section;

                    var h4 = document.createElement("h4");
                    h4.innerText = section;
                    contain.appendChild(h4);
                    
                    ul = document.createElement("ul");
                    contain.appendChild(ul);
                }

                var li = document.createElement("li");

                var hasSkill = false;

                for (var i = 0; i < items.length; i++)
                {
                    if (skill.id && skill.id > 0)
                    {
                        if (items[i].item_id == skill.id)
                        {
                            hasSkill = true;
                            break;
                        }
                    }
                    else if (items[i] && items[i].name)
                    {
                        if (items[i].name.en == skill.name)
                        {
                            hasSkill = true;
                            break;
                        }
                    }
                }

                li.innerText = skill.name;
                li.title = skill.id;

                if (hasSkill) {
                    li.className = 'good';
                } else {
                    li.className = 'bad';
                }

                ul.appendChild(li);
            }
        }
        
        $('footer_loading').style.display = 'none';
        $('userdetail_results').style.display = '';
    });

    return false;
}

function sort(e, cell)
{
    var table = e.parentNode.parentNode.parentNode;

    if (table.tagName != 'TABLE') {
        return;
    }

    var tbody = table.getElementsByTagName('tbody')[0];

    if (!tbody) {
        return;
    }

    var direction = -1;
    var alreadySorted = false;

    if (table.dataset.sorted == cell + '-') {
        direction = 1;
        table.dataset.sorted = cell + '+';
        alreadySorted = true
    } else {
        alreadySorted = (table.dataset.sorted == cell + '+');
        table.dataset.sorted = cell + '-';
    }

    var rows = tbody.getElementsByTagName('tr');

    var numeric = !isNaN(rows[0].children[cell].innerText);

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var rowCell = row.children[cell];
        var last = row;
        
        if (alreadySorted) {
            if (i < rows.length - 1) {
                row = rows[0];
                last = rows[rows.length - i];
            }
        } else {
            for (var c = i - 1; c >= 0; c--) {
                var compare = rows[c];
                var compareCell = compare.children[cell];
                var ret = 0;

                if (rowCell.dataset.value) {
                    if (Number(rowCell.dataset.value) < Number(compareCell.dataset.value)) {
                        ret = direction;
                    }
                } else {
                    if (numeric) {
                        if (Number(rowCell.innerText) < Number(compareCell.innerText)) {
                            ret = direction;
                        }
                    } else {
                        ret = rowCell.innerText.localeCompare(compareCell.innerText);
                    }
                }

                if (ret == direction) {
                    last = compare;
                } else {
                    break;
                }
            }
        }
        
        if (row != last) {
            tbody.insertBefore(row, last);
            // new, existing
        }
    }
}

this.addEventListener('load', app);
