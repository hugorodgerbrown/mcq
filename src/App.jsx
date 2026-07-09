import React, { useState, useMemo, useCallback } from "react";

export const QUESTIONS = [
  {id:1,cat:"General biology & behaviour",q:"What are normally the last deer to change from winter coat into summer coat?",A:"Male deer",B:"Young deer",C:"Female deer",D:"Old deer",correct:"D"},
  {id:2,cat:"General biology & behaviour",q:"Which male antlered deer usually cast their antlers first?",A:"Kids",B:"Old animals",C:"Perruques",D:"Yearlings",correct:"B"},
  {id:3,cat:"General biology & behaviour",q:"Under what circumstances do female deer usually give birth to their young?",A:"In the middle of the herd for protection",B:"Quietly and alone in cover",C:"Out in the open where she can see danger approaching",D:"With the buck in close attendance waiting to breed afterwards",correct:"B"},
  {id:4,cat:"General biology & behaviour",q:"The antler casting cycle is mainly governed by which hormone?",A:"Adrenaline",B:"Testosterone",C:"Progesterone",D:"Oestrogen",correct:"B"},
  {id:5,cat:"General biology & behaviour",q:"For a few days after their birth, young deer generally:",A:"Are left alone in cover by their mothers between suckling bouts",B:"Run with their mothers from an hour or two after birth",C:"Join in groups with other newly born deer",D:"Are led to low ground without delay",correct:"A"},
  {id:6,cat:"General biology & behaviour",q:"A female deer will not conceive unless:",A:"She is in her home range",B:"She reaches a certain threshold body weight",C:"She is at least 4 years old",D:"She has been covered by at least two males",correct:"B"},
  {id:7,cat:"General biology & behaviour",q:"What is the primary limiting factor of a deer's life span?",A:"Loss of its territory",B:"Being killed by other deer",C:"Its teeth wearing out so that it cannot feed efficiently",D:"The strain of growing antlers or producing young",correct:"C"},
  {id:8,cat:"General biology & behaviour",q:"A buck whose antlers in season are a spongy mass of velvet (a perruque head) should:",A:"Be culled as it may become infected and he will probably die",B:"Be protected and must not be shot",C:"Be preserved as good breeding stock",D:"Soon come into hard antler and produces a normal head",correct:"A"},
  {id:9,cat:"General biology & behaviour",q:"Why do deer ruminate?",A:"It helps them to rest",B:"It is essential to their digestion",C:"It is a reaction to stress",D:"It eliminates indigestible food",correct:"B"},
  {id:10,cat:"General biology & behaviour",q:"What is the preferred habitat of most species of deer in the United Kingdom?",A:"Woodland margins",B:"Moorland",C:"Pasture",D:"Wetlands",correct:"A"},
  {id:11,cat:"General biology & behaviour",q:"The effect of rising numbers of deer in an area is likely to be first noticed through?",A:"Reduced diversity of plants at ground level and increased crop damage",B:"Reduced birth rate",C:"Increased antler quality",D:"Reduced birth weight",correct:"A"},
  {id:12,cat:"General biology & behaviour",q:"How are deer wallows best described?",A:"Pure and sweet smelling",B:"Dry and dusty",C:"Muddy and often scented with urine",D:"Rocky with fast flowing water",correct:"C"},
  {id:13,cat:"General biology & behaviour",q:"Deer under normal undisturbed conditions will:",A:"Feed continuously all day long",B:"Only feed at night",C:"Feed in cycles of a few hours with peaks at dawn/dusk",D:"Only feed in daylight",correct:"C"},
  {id:14,cat:"General biology & behaviour",q:"Deer are rarely seen to drink. This is because:",A:"They drink once every few days",B:"They get most of the water they need from their food",C:"In hot weather they stay in the shade",D:"They only drink at night",correct:"B"},
  {id:15,cat:"General biology & behaviour",q:"Scent glands in most UK deer are located:",A:"Behind the ears and under the chin",B:"Between hooves, in corner of eye and outside hock",C:"All along the neck and spine",D:"On their chest and shoulders",correct:"B"},
  {id:16,cat:"General biology & behaviour",q:"Fraying is the term used to describe which activity of a male deer?",A:"Rubbing the bark from trees and shrubs with antlers",B:"Eating the bark of trees and shrubs",C:"Making territorial marks on the ground using hooves",D:"Changing coat",correct:"A"},
  {id:17,cat:"General biology & behaviour",q:"What is the term used to describe the covering of a deer's growing antlers?",A:"Guard hair",B:"Under coat/fur",C:"Velvet",D:"Bare skin",correct:"C"},
  {id:18,cat:"General biology & behaviour",q:"A reasonable estimation of the age class of a deer when it has been killed can be gained from:",A:"The number of points on its antler",B:"The amount of fat around its kidneys",C:"The amount of wear on its hooves",D:"The amount of wear on its teeth",correct:"D"},
  {id:19,cat:"General biology & behaviour",q:"'Browsing' is the term, which describes:",A:"Deer feeding on leaves and buds",B:"Deer feeding on grass and herbs",C:"Deer raiding cereal crops",D:"Deer eating root crop",correct:"A"},
  {id:20,cat:"General biology & behaviour",q:"Where are a deer's antlers shed and regrown from each year?",A:"The burr",B:"The coronet",C:"The pedicle",D:"The beam",correct:"C"},
  {id:21,cat:"General biology & behaviour",q:"Which of the following descriptions apply to deer droppings?",A:"Often black or dark brown, shiny when fresh often with ends pointed or indented",B:"Always perfectly cylindrical",C:"Always round and fibrous",D:"Pale in colour and similar to small fox droppings",correct:"A"},
  {id:22,cat:"The shot & after",q:"After the shot, a deer hunches its back and walks slowly into cover. This is a typical reaction from an animal, which has been hit in:",A:"The heart",B:"The lungs",C:"The gut",D:"The neck",correct:"C"},
  {id:23,cat:"The shot & after",q:"If you suspect that you have wounded a deer and it has disappeared from sight, what should you do?",A:"Wait for 10-15 minutes before going forward to the place where it was standing when you shot",B:"Wait for 1 minute before going forward to the place it was standing when shot",C:"Go straight to where you last saw it before it disappeared",D:"Go round behind where you last saw it and approach the place from there",correct:"A"},
  {id:24,cat:"The shot & after",q:"After the shot, the deer kicks out its hind legs and rushes into cover with neck outstretched. Traces of pink and frothy blood are found. Where has it been hit?",A:"The heart",B:"The lungs",C:"The liver",D:"The kidneys",correct:"B"},
  {id:25,cat:"The shot & after",q:"After a shot, the deer falls down and gets up almost immediately or staggers before rushing away. Only a few drops of blood, some short hair and a long splinter of bone is found. Where has it been hit?",A:"The gut",B:"The lungs",C:"The leg",D:"The spine",correct:"C"},
  {id:26,cat:"The shot & after",q:"You are stalking in woodland and spot a deer from a range of about 40 metres behind a large tree. All you can see is the animal's head looking sideways. What is the recommended procedure for taking a shot?",A:"Shoot at its eye",B:"Wait until it exposes the chest area and take a heart/lung shot",C:"Shoot at a point half way between the eye and base of the ear",D:"Make a noise so it looks at you before shooting it between the eyes",correct:"B"},
  {id:27,cat:"The shot & after",q:"Which is the best point of aim to ensure a humane kill at most sensible distances?",A:"The centre of the head",B:"Half way up the body just behind the shoulder",C:"High in the neck",D:"Low in the neck",correct:"B"},
  {id:28,cat:"The shot & after",q:"If you intend to shoot one deer, how much ammunition should you carry whilst stalking?",A:"One round loaded in the rifle",B:"One round loaded in the rifle and one in the pocket",C:"One round loaded in the rifle and one in the magazine",D:"One round loaded in the rifle, more than one in the magazine and some spare in the pocket",correct:"D"},
  {id:29,cat:"The shot & after",q:"What is the main purpose of stalking to within easy range of a deer?",A:"To ensure a humane kill",B:"To check the quality of the antlers before taking the shot",C:"To test the stalkers ability to get in close",D:"To increase the chances of spotting an additional shootable deer",correct:"A"},
  {id:30,cat:"The shot & after",q:"What is the advantage of a telescopic sight?",A:"Very long shots can be taken with ease",B:"You can aim more precisely at all ranges",C:"You do not need to carry binoculars to identify the deer",D:"It enables you to see and shoot the deer through undergrowth",correct:"B"},
  {id:31,cat:"The shot & after",q:"Within woodlands, at what range are the majority of deer shot?",A:"Under 100 metres",B:"100-150 metres",C:"150-200 metres",D:"200-300 metres",correct:"A"},
  {id:32,cat:"The shot & after",q:"A wounded stag is struggling hard but seems unable to run away and could possibly be approached. Should it be?",A:"Returned to later, accompanied by a dog",B:"Shot again if safe to do so",C:"Left to die in peace",D:"Held down to be finished off with a knife",correct:"B"},
  {id:33,cat:"The shot & after",q:"When a deer drops instantly to the shot, what should you do?",A:"Rush up to it ready to finish it off if it's not dead",B:"Immediately shoot at it again where it lies",C:"Remain where you are, ready to shoot again and observe the animal",D:"Unload and prepare to gralloch because it is dead for sure",correct:"C"},
  {id:34,cat:"The shot & after",q:"After successfully shooting a deer from a group, what should you do?",A:"Stay still until the remaining deer in the immediate area have moved out of sight",B:"Stand up and frighten the rest of the deer away quickly",C:"Rush up and bleed the carcass before the heart has stopped beating",D:"Drag the carcass away from the other deer as soon as possible",correct:"A"},
  {id:35,cat:"Safety & fieldcraft",q:"Which of the following factors are most important for safety in the choice of a stalker's knife?",A:"Non-slip handle",B:"Curved blade for skinning",C:"Appearance",D:"Serrated blade for cutting through bone",correct:"A"},
  {id:36,cat:"Safety & fieldcraft",q:"Which of the following items is the most important for a sensible stalker to carry with him whilst out stalking?",A:"A suitable cleaning kit",B:"A box of matches",C:"A bottle of gun oil",D:"A screwdriver",correct:"A"},
  {id:37,cat:"Safety & fieldcraft",q:"What is the advantage in using a high seat?",A:"The deer may not see the stalker",B:"The deer may not smell the stalker",C:"The shot is likely to be safer than one taken from ground level",D:"All of the above",correct:"D"},
  {id:38,cat:"Safety & fieldcraft",q:"When stalking alone on leased ground, which of the following might you carry?",A:"Certificate of insurance",B:"Firearms Certificate",C:"Permission to stalk signed by the landowner/occupier or holder of the stalking right",D:"All of the above",correct:"D"},
  {id:39,cat:"Safety & fieldcraft",q:"The use of a stick (or split sticks) as a stalking aid is:",A:"Sensible because it makes shooting and spying steadier",B:"Unsporting because it makes shooting too easy",C:"Unnecessary because it is easier and quicker to shoot freehand",D:"Tiring because it is one more heavy and awkward thing to carry",correct:"A"},
  {id:40,cat:"Safety & fieldcraft",q:"You are on a steep bank above a deer, which shooting position is likely to be the most comfortable and stable?",A:"Prone",B:"Sitting",C:"Freehand",D:"Standing",correct:"B"},
  {id:41,cat:"Safety & fieldcraft",q:"When should the bolt be removed from the rifle whilst stored in the home?",A:"All the time to avoid its use by an unauthorised person e.g. child/thief",B:"Only when you wish to clean the bolt",C:"Only when necessary to avoid a build-up of condensation",D:"Occasionally to ease pressure on the striker spring",correct:"A"},
  {id:42,cat:"Safety & fieldcraft",q:"When should you take off the safety catch whilst deer stalking?",A:"When you load the rifle and set off with it safely slung over your shoulder",B:"When you start the final approach on a stalk",C:"When you enter thick cover and silence is essential",D:"When you are in the aim and about to squeeze the trigger",correct:"D"},
  {id:43,cat:"Safety & fieldcraft",q:"Someone offers you a rifle with the bolt closed. What should you do?",A:"Refuse to accept the rifle until he/she proves that it is unloaded",B:"Take the rifle and ask him/her if it is loaded before pulling the trigger to check",C:"Point it in a safe direction and pull the trigger to check",D:"Open the bolt and look inside to prove it empty",correct:"A"},
  {id:44,cat:"Safety & fieldcraft",q:"When shooting deer in woods or on level ground safety can be improved by?",A:"Lying down to take every shot",B:"Using a high seat",C:"Only shooting at deer with a screen of bushes behind them to break up the bullets",D:"Only shooting into open spaces e.g. down rides",correct:"B"},
  {id:45,cat:"Safety & fieldcraft",q:"If you accidentally plug your barrel with peat or snow, what should you do?",A:"Fire a shot to clear it",B:"Carry on and take more care of your rifle",C:"Unload all cartridges at once and properly clean the bore",D:"Push the obstruction down the barrel as far from the muzzle as possible",correct:"C"},
  {id:46,cat:"Safety & fieldcraft",q:"When approaching a deer you have shot and that you believe to be dead, what should your first action be?",A:"Stick a knife into the base of the neck to bleed it",B:"Make sure it is dead by touching an eyeball and watching for 'eye-blink' reaction",C:"Grab the back leg to restrain it in case it is still alive",D:"Shoot it in the head to make sure it is dead",correct:"B"},
  {id:47,cat:"Safety & fieldcraft",q:"If you have to shoot an injured deer at close range, what should you do?",A:"Lie down to ensure a steady shot at the neck outlined clearly against the sky",B:"Get close enough so you can rest the rifle muzzle against the deer's skin",C:"Ensure there is a soft safe backstop behind the deer to stop the bullet",D:"Get someone to hold a leg to keep the animal still",correct:"C"},
  {id:48,cat:"Safety & fieldcraft",q:"A safe backstop is required before you take a shot at a deer. What is the best form of backstop?",A:"Clear air, i.e. a silhouette target with nothing behind the deer",B:"A dense screen of bushes and scrub which will absorb the bullet",C:"A belt of trees or a thick plantation",D:"A rising bank of soft ground",correct:"D"},
  {id:49,cat:"Safety & fieldcraft",q:"When stalking deer in thick cover should you?",A:"Use a slow, heavy calibre bullet to cut through the twigs and underbrush",B:"Use a fast light calibre bullet to cut through the twigs and underbrush",C:"Use solid (full metal jacket) bullets to avoid bullet break-up on twigs",D:"Not take any shots at deer that are not fully visible and without a safe backstop",correct:"D"},
  {id:50,cat:"Safety & fieldcraft",q:"What is the maximum distance that a bullet from a deer rifle might travel if there is no solid backstop?",A:"500-1000 metres",B:"3500-5000 metres",C:"5500-6000 metres",D:"10,000 metres",correct:"B"},
  {id:51,cat:"Safety & fieldcraft",q:"When crawling towards deer with a companion what best describes the recommended condition for the rifles?",A:"Only the leader's rifle should be loaded and pointing forwards",B:"Both rifles should be loaded in case other deer appear behind you",C:"Neither rifle should be loaded until the firing position is reached",D:"Only the second person should have a loaded rifle, the leader should be selecting the route",correct:"A"},
  {id:52,cat:"Safety & fieldcraft",q:"Stalking in fog is:",A:"Easy because you can approach the deer unseen",B:"Dangerous because you cannot be sure of a safe backdrop",C:"Safer because walkers will not be on the hill",D:"More exciting because you cannot be sure where the deer are",correct:"B"},
  {id:53,cat:"Safety & fieldcraft",q:"Carrying a rifle with the firing pin resting on a chambered round is:",A:"Always dangerous and must never be done",B:"Acceptable only in woodland stalking",C:"Acceptable if the rifle is in its case",D:"Acceptable if the safety catch is applied thus locking the bolt",correct:"A"},
  {id:54,cat:"Safety & fieldcraft",q:"Before you climb into a high seat what should you do?",A:"Ensure that the rifle is loaded in case you see a deer as you climb the ladder",B:"Cut some branches to improve your concealment as you climb",C:"Check the ladder and seat for damage and unload your rifle before climbing into the seat",D:"Rest the loaded rifle against the base of the seat and pull it up on a cord when you are safely seated",correct:"C"},
  {id:55,cat:"Law & firearms",q:"In England and Wales what is the minimum muzzle energy required from a rifle to be legal for stalking all species of deer?",A:"1600 ft/lbs (2168 joules)",B:"1700 ft/lbs (2305 joules)",C:"1750 ft/lbs (2373 joules)",D:"1800 ft/lbs (2439 joules)",correct:"B"},
  {id:56,cat:"Law & firearms",q:"In England and Wales which of the following rifle and ammunition combinations Is ILLEGAL for use to kill deer?",A:".222 Remington 45gr hollow point bullet (ME: 1000 ft lbs/1356 joules)",B:".243 Winchester 100gr soft nose bullet (ME: 2090 ft lbs/2831 joules)",C:"30-30 Winchester 170gr soft nose bullet (ME: 1765 ft lbs/2397 joules)",D:"30-06 Springfield 180gr soft nose bullet (ME: 2914 ft lbs/3948 joules)",correct:"A"},
  {id:57,cat:"Law & firearms",q:"In England and Wales it is illegal to shoot any deer at night unless injured. How is \"night\" defined in law?",A:"When you cannot read a car number plate at 25 metres",B:"Between one hour after sunset and one hour before sunrise",C:"During official \"lighting up time\" as published in the local newspapers",D:"Between 2000 hours GMT and 0800 hours GMT",correct:"B"},
  {id:58,cat:"Law & firearms",q:"Red stags are grazing on the edge of an airfield during the hours of darkness. The deer pose a threat to public safety if they are not dealt with. Who in England would issue a night shooting licence:",A:"Defra",B:"Civil Aviation Authority",C:"Natural England",D:"The airport owners",correct:"C"},
  {id:59,cat:"Law & firearms",q:"If you wish to net or trap deer in England from whom, is permission obtained?",A:"You can net or trap wild deer without permission",B:"The owner of the land where the deer are to be trapped",C:"The Forestry Commission",D:"Through Natural England",correct:"D"},
  {id:60,cat:"Law & firearms",q:"If you wish to net or trap deer in Wales from whom, is permission obtained?",A:"You can net or trap wild deer without permission",B:"The owner of the land where the deer are to be trapped",C:"The Forestry Commission",D:"Natural Resources Wales",correct:"D"},
  {id:61,cat:"Law & firearms",q:"What is the minimum legal calibre for a roe deer rifle in England and Wales?",A:".222\"",B:".243\"",C:".240\"",D:".270\"",correct:"C"},
  {id:62,cat:"Law & firearms",q:"What is the minimum legal calibre for a muntjac and CWD deer rifle in England and Wales?",A:".220\"",B:".243\"",C:".240\"",D:".270\"",correct:"A"},
  {id:63,cat:"Law & firearms",q:"In England, where would you go to for the definitive up to date male Roe season?",A:"Natural Resources Wales",B:"NatureScot",C:"Natural England",D:"Department of Agriculture, Environment and Rural Affairs",correct:"C"},
  {id:64,cat:"Law & firearms",q:"In Wales, where would you go to for the definitive up to date male Red season?",A:"Natural Resources Wales",B:"Natural England",C:"Department of Agriculture, Environment and Rural Affairs",D:"NatureScot",correct:"A"},
  {id:65,cat:"Law & firearms",q:"In Wales, where would you go to for the definitive up to date male Fallow season?",A:"Natural England",B:"Natural Resources Wales",C:"NatureScot",D:"Department of Agriculture, Environment and Rural Affairs",correct:"B"},
  {id:66,cat:"Law & firearms",q:"In England, where would you go to for the definitive up to date male Sika season?",A:"Natural Resources Wales",B:"Department of Agriculture, Environment and Rural Affairs",C:"NatureScot",D:"Natural England",correct:"D"},
  {id:67,cat:"Law & firearms",q:"In Wales, where would you go to for the definitive up to date Red hind season?",A:"Natural Resources Wales",B:"Natural England",C:"Department of Agriculture, Environment and Rural Affairs",D:"NatureScot",correct:"A"},
  {id:68,cat:"Law & firearms",q:"In England, where would you go to for the definitive up to date Sika hind season?",A:"Natural Resources Wales",B:"NatureScot",C:"Natural England",D:"Department of Agriculture, Environment and Rural Affairs",correct:"C"},
  {id:69,cat:"Law & firearms",q:"In Wales, where would you go to for the definitive up to date Fallow doe season?",A:"Natural England",B:"Natural Resources Wales",C:"NatureScot",D:"Department of Agriculture, Environment and Rural Affairs",correct:"B"},
  {id:70,cat:"Law & firearms",q:"In England, where would you go to for the definitive up to date Roe doe season?",A:"Natural England",B:"Department of Agriculture, Environment and Rural Affairs",C:"NatureScot",D:"Natural Resources Wales",correct:"A"},
  {id:71,cat:"Law & firearms",q:"In England, where would you go to for the definitive up to date Chinese Water Deer doe season?",A:"Natural England",B:"Natural Resources Wales",C:"Department of Agriculture, Environment and Rural Affairs",D:"NatureScot",correct:"A"},
  {id:72,cat:"Law & firearms",q:"In England and Wales in certain circumstances shotguns firing non-spherical projectiles (slug) weighing more than 350 grains or certain shot may be used to kill deer which are not injured but doing serious damage to crops. Which of the following may be used?",A:"A 20 bore shotgun or larger with AAA shot or legal slug",B:"A 12 bore shotgun or larger with SSG shot only",C:"A 12 bore shotgun or larger with AAA shot only or legal slug",D:"A .410 bore but with slug only",correct:"C"},
  {id:73,cat:"Law & firearms",q:"Under what circumstances is it legal for an occupier to shoot uninjured deer out of season in England?",A:"If you were unable to do so in the open season due to illness (certified by a doctor)",B:"If deer of the same species are seriously damaging your agricultural crops and you cannot prevent further damage by other means, and you shoot them where the damage is occurring",C:"If the game keeper would not let you do so in the open season due to risk of disturbing the pheasant shooting",D:"If they are eating all the bluebells and other wild flowers",correct:"B"},
  {id:74,cat:"Law & firearms",q:"In England what type of appropriate calibre rifle bullets may legally be used to kill deer?",A:"Any soft nosed or hollow nosed bullet",B:"Any bullet weighing over 50 grains",C:"Any bullet with a metal jacket totally covering the lead core",D:"Only a bullet over 100 grains with a metal jacket totally covering the lead core",correct:"A"},
  {id:75,cat:"Law & firearms",q:"Shooting deer from a vehicle in England & Wales is?",A:"Legal anywhere",B:"Only legal from a stationary vehicle with the engine switched off",C:"Legal at night without the occupier's written permission but with a DEFRA permit",D:"Illegal in all circumstances",correct:"B"},
  {id:76,cat:"Law & firearms",q:"Which of the following is illegal to use for shooting muntjac in England & Wales?",A:"A .222 and 50 grain soft nosed ammunition",B:"Any rifle and bullet combination legal for other species of deer",C:"A .22 LR with hollow-point bullets",D:"A 5.56 mm using 50 grain soft-nosed or hollow-point bullets",correct:"C"},
  {id:77,cat:"Law & firearms",q:"You stalk a roe doe and her buck kid during January in England. You intend to cull the doe can you also cull the buck kid?",A:"No roe bucks are out of season in January",B:"No unless you have a license to shoot out of season",C:"Yes if the landowner tells you too",D:"Yes the law allows dependent young to be culled in such circumstances",correct:"D"},
  {id:78,cat:"Law & firearms",q:"In Scotland, where would you go to for the definitive up to date Red hind season?",A:"Natural England",B:"Natural Resources Wales",C:"NatureScot",D:"Department of Agriculture, Environment and Rural Affairs",correct:"C"},
  {id:79,cat:"Law & firearms",q:"In Scotland, where would you go to for the definitive up to date Sika hind season?",A:"NatureScot",B:"Natural Resources Wales",C:"Natural England",D:"Department of Agriculture, Environment and Rural Affairs",correct:"A"},
  {id:80,cat:"Law & firearms",q:"In Scotland, where would you go to for the definitive up to date Fallow doe season?",A:"Natural Resources Wales",B:"NatureScot",C:"Department of Agriculture, Environment and Rural Affairs",D:"Natural England",correct:"B"},
  {id:81,cat:"Law & firearms",q:"In Scotland, where would you go to for the definitive up to date Roe doe season?",A:"Natural England",B:"Department of Agriculture, Environment and Rural Affairs",C:"Natural Resources Wales",D:"NatureScot",correct:"D"},
  {id:82,cat:"Law & firearms",q:"To sell venison legally in Scotland, a person who is not a licensed venison dealer:",A:"Can only sell to licensed Venison dealer",B:"Must own the land where it was shot and keep records",C:"May sell it to an hotel or restaurant or butchers shop even if it does not have a venison dealer's license",D:"May barter it for something else",correct:"A"},
  {id:83,cat:"Law & firearms",q:"Which is the statutory body responsible for the conservation and control of deer in Scotland?",A:"The Forestry Commission",B:"The British Deer Society",C:"The Association of Deer Management Groups",D:"NatureScot",correct:"D"},
  {id:84,cat:"Law & firearms",q:"What is the minimum legal muzzle velocity allowed for a bullet to shoot deer in Scotland?",A:"1700 ft/sec",B:"1750 ft/sec",C:"1900 ft/sec",D:"2450 ft/sec",correct:"D"},
  {id:85,cat:"Law & firearms",q:"What is the minimum legal bullet weight for use on sika deer in Scotland?",A:"50 grains",B:"75 grains",C:"80 grains",D:"100 grains",correct:"C"},
  {id:86,cat:"Law & firearms",q:"What is the minimum legal muzzle energy of a bullet for use on red deer in Scotland?",A:"1000 ft/lbs",B:"1700 ft/lbs",C:"1750 ft/lbs",D:"2450 ft/lbs",correct:"C"},
  {id:87,cat:"Law & firearms",q:"Shooting any species of deer in Scotland is allowed on a Sunday:",A:"Under no circumstances",B:"Only if the shooting would be legal on any other day of the week",C:"Only if authorised by a Church Official",D:"Only with permission from the Police",correct:"B"},
  {id:88,cat:"Law & firearms",q:"Under what circumstances may a deer be killed in England, Scotland and Wales with a .22 rimfire without breaking the law?",A:"When it is marauding in a suburban garden",B:"By a foreign visitor",C:"At night using a spotlight",D:"When injured to prevent further suffering",correct:"D"},
  {id:89,cat:"Law & firearms",q:"If serious deer damage to crops or trees is being suffered by foresters or tenant farmers on fenced land in Scotland, what are their legal options?",A:"They can shoot deer at night without permission",B:"They can shoot deer at night with the landowner's written permission",C:"They can apply to NatureScot for a night shooting permit",D:"They can trap or snare the deer concerned because shooting at night is not allowed",correct:"C"},
  {id:90,cat:"Law & firearms",q:"In Scotland the use of a Thermal Imaging or Image Intensifying sight at night is",A:"Illegal under any circumstance",B:"Has no restrictions",C:"Legal with authorisation from NatureScot",D:"Legal if you can't get out during daylight hours",correct:"C"},
  {id:91,cat:"Law & firearms",q:"In Scotland a Thermal Imaging or Image Intensifying sight",A:"Can only be used within the hours defined as daylight",B:"Can be used at night with authorisation from NatureScot",C:"Is illegal only Thermal Imaging or Image Intensifying spotting scopes are allowed",D:"Can be used at night with permission from the landowner",correct:"B"},
  {id:92,cat:"Law & firearms",q:"Deer marauding into crops in Scotland may legally be?",A:"Snared",B:"Shot using any firearm/ammunition legal for that species under normal circumstances",C:"Shot using any shotgun and size of shot",D:"Shot using a 12 bore loaded with a single spherical ball",correct:"B"},
  {id:93,cat:"Law & firearms",q:"As a land owner or holder of the shooting rights, you can release big red stags on your land to improve the wild stock?",A:"Anywhere in Scotland",B:"Nowhere in Scotland",C:"Anywhere except the Hebrides and some Western Isles",D:"Anywhere with permission from NatureScot",correct:"C"},
  {id:94,cat:"Law & firearms",q:"Who issues Firearms Certificates in Scotland?",A:"NatureScot",B:"The Scottish Office",C:"Police Scotland",D:"The local District Council",correct:"C"},
  {id:95,cat:"Law & firearms",q:"In England, Scotland and Wales if a deer has been injured on the road?",A:"It may be killed at night or out of season without permission by any means",B:"Only a RSPCA officer may kill it out of season",C:"The police must be called to authorise its humane dispatch at night",D:"Only the landowner may kill it",correct:"A"},
  {id:96,cat:"Law & firearms",q:"You are visiting an estate in Scotland to stalk Stags in August. The stalker tells you to shoot a red hind (out of season) because it is marauding on some turnips:",A:"You may do so only if it is actually in the turnip field",B:"You may only do so if you are specifically named on a NatureScot authorisation",C:"You may only do so if you have actually seen the damage yourself and judge it to be serious",D:"It would be legal for a paying guest to do so under the stalkers guidance",correct:"B"},
  {id:97,cat:"Law & firearms",q:"What is the minimum bullet weight, which may be legally used to shoot roe deer only in Scotland?",A:"50 grains",B:"55 grains",C:"90 grains",D:"100 grains",correct:"A"},
  {id:98,cat:"Law & firearms",q:"What is the minimum legal muzzle energy allowed for a bullet to shoot roe deer only, in Scotland?",A:"950 ft/lbs",B:"1000 ft/lbs",C:"1500 ft/lbs",D:"1750 ft/lbs",correct:"B"},
  {id:99,cat:"Law & firearms",q:"Your deer rifle needs adjusting by a gunsmith but you are busy. What are your legal options?",A:"You can tell your partner to take it in as long as he/she is over 17 and takes your Firearm Certificate with him/her",B:"You can send it by normal parcel post",C:"You can send it by a firearms registered carrier",D:"You can tell anyone over 21 to take it in as long as they have your FAC with them and your instructions in writing",correct:"C"},
  {id:100,cat:"Law & firearms",q:"Why have muntjac no legal Close Season in Britain?",A:"They have the status of pests and must be shot on sight",B:"They breed all the year round and therefore a Close Season will not protect new-born fawns",C:"You cannot tell the sexes apart so could not obey a Close Season",D:"The fawns are self sufficient from birth therefore do not need parental support",correct:"B"},
  {id:101,cat:"Law & firearms",q:"Under what circumstances can you have a rifle and ammunition for it in your car on the public road?",A:"At any time in case you find a deer injured by a traffic accident",B:"If you can prove you have lawful authority and reasonable excuse",C:"If you are visiting a farm where you hope to get permission to stalk",D:"If you have the bolt removed from the rifle",correct:"B"},
  {id:102,cat:"Law & firearms",q:"What is the legal position in regard to shooting deer with a bow and specially designed hunting arrows?",A:"It is not legal anywhere in UK",B:"It is only legal in an enclosed deer park",C:"It is legal in Scotland but not England or Wales",D:"It is legal for foreigners with a permit from the Tourist Board",correct:"A"},
  {id:103,cat:"Law & firearms",q:"Who owns wild deer while they are alive?",A:"The owner of the land on which they are found",B:"The Government",C:"The holder of the deer stalking rights over the land on which they are found",D:"No one",correct:"D"},
  {id:104,cat:"Law & firearms",q:"From where would you obtain written permission to shoot deer on land which does not belong to you?",A:"The Police",B:"DEFRA",C:"Holder of the deer stalking rights",D:"The Local County Council",correct:"C"},
  {id:105,cat:"Law & firearms",q:"If you are unable to produce your Firearm Certificate when a Police Officer asks you for it?",A:"He/she may legally seize and hold your firearms until you produce it",B:"He/she may require that you produce your certificate at a police station within 24 hours",C:"You are liable to prosecution for failure to carry a valid certificate with you",D:"He/she must accept a photocopy of your certificate instead",correct:"A"},
  {id:106,cat:"Law & firearms",q:"In the UK where may you release sika into the wild?",A:"Anywhere with the landowner's permission",B:"Anywhere except England and Wales",C:"Not at All",D:"Under license, but excluding the Western Isles",correct:"D"},
  {id:107,cat:"Law & firearms",q:"Which of the following types of full bore rifle is illegal in the United Kingdom?",A:"Lever action rifle",B:"Single shot rifle",C:"Bolt action rifle",D:"Semi automatic rifle",correct:"D"},
  {id:108,cat:"Law & firearms",q:"Your stalking partner has asked you to store his rifle in your gun cabinet whilst he is on holiday, because there have been a number of burglaries in the area. What is the legal position?",A:"You may do so for up to three weeks",B:"You may do so only if you inform the police by registered letter within seven days",C:"You may not do so only if he removes the bolt so that you cannot use the rifle illegally",D:"You may do so only if your FAC has his rifle entered on it",correct:"D"},
  {id:109,cat:"Law & firearms",q:"Your 14 year old son passed the written assessment of the Deer Stalking Certificate (Level One) and shoots well with a .22\" in the Cadet Corps. He now wants to go deer stalking but has no Firearm Certificate. What are your legal options? (not used In Northern Ireland)",A:"He can use your rifle, once he has first obtained a Firearms Certificate for that rifle",B:"You can lend him your rifle without a Certificate as long as you supervise him closely",C:"You can allow him to buy a rifle himself having first obtained a Firearms Certificate",D:"You send him out under supervision of a local game keeper whose estate rifle he will borrow",correct:"A"},
  {id:110,cat:"Law & firearms",q:"The holder of a Firearm Certificate may legally:",A:"Purchase a rifle or ammunition when they are 14",B:"Purchase a rifle or ammunition when they are 16",C:"Purchase a rifle or ammunition when they are 17",D:"Purchase a rifle or ammunition when they are 18",correct:"D"},
  {id:111,cat:"Law & firearms",q:"A heart shot deer runs 80 metres before falling dead in the middle of a neighbour's field. What are your legal options?",A:"You can retrieve it without asking permission",B:"You can retrieve it without asking permission, but only if you leave your rifle on your side of the boundary",C:"You can retrieve it only with permission from the neighbour",D:"You can retrieve it only if you can prove that it was shot on your side of the boundary if anyone stops you",correct:"C"},
  {id:112,cat:"Law & firearms",q:"An injured Muntjac deer taken into animal sanctuary and now fully recovered",A:"May be released but only after it has been certified fit and healthy by a vet",B:"May never be released back into the wild",C:"May be released with permission from the County Council",D:"May be released but only within 2 KM of where it was taken",correct:"B"},
  {id:113,cat:"Law & firearms",q:"You have bought a farm and woods in North Wales but there are no deer on it and you would like to investigate a release programme. Which of the following best describes the option open to you?",A:"You may release any species of deer there without permission",B:"You may not release any deer there without permission",C:"You may only release red, roe or fallow deer without a license",D:"You can get permission from DEFRA to release any deer there",correct:"C"},
  {id:114,cat:"Law & firearms",q:"What is the minimum bullet weight, which may be legally used to take deer in Northern Ireland?",A:"50 grains",B:"80 grains",C:"100 grains",D:"130 grains",correct:"C"},
  {id:115,cat:"Law & firearms",q:"Within Northern Ireland (NI) what is the primary legislation giving protection to deer?",A:"The Firearms (NI) Order 2004 and subsequent amendments",B:"The Wildlife (NI) Order 1985 and subsequent amendments",C:"The Deer Act 1991",D:"The Wildlife and Countryside Act 1981 and subsequent amendments",correct:"B"},
  {id:116,cat:"Law & firearms",q:"What is the minimum bullet diameter that is legally required to take deer in Northern Ireland?",A:"0.236\"",B:"0.240\"",C:"0.243\"",D:"0.270\"",correct:"A"},
  {id:117,cat:"Law & firearms",q:"In Northern Ireland, where would you go to for the definitive up to date Red hind season?",A:"Natural Resources Wales",B:"Department of Agriculture, Environment and Rural Affairs",C:"NatureScot",D:"Natural England",correct:"B"},
  {id:118,cat:"Law & firearms",q:"In Northern Ireland, where would you go to for the definitive up to date fallow buck season?",A:"Natural England",B:"Department of Agriculture, Environment and Rural Affairs",C:"Natural Resources Wales",D:"NatureScot",correct:"B"},
  {id:119,cat:"Law & firearms",q:"In Northern Ireland, where would you go to for the definitive up to date sika stags season?",A:"NatureScot",B:"Natural England",C:"Department of Agriculture, Environment and Rural Affairs",D:"Natural Resources Wales",correct:"C"},
  {id:120,cat:"Law & firearms",q:"In Northern Ireland and in certain circumstances shotguns firing a single non-spherical projectile weighing more than 350 grains (22.68 grammes), or AAA shot (.230 inches / 5.16 mm) may be used to kill deer which are not injured but doing serious damage to crops. Which of the following gauge of shotgun may be used?",A:"A 20 bore shot gun or larger",B:"A 16 bore shotgun or larger",C:"A 12 bore shotgun or larger",D:"A 410 bore may be used but with slug only",correct:"C"},
  {id:121,cat:"Law & firearms",q:"In Northern Ireland, in certain circumstances, you may lend your rifle to a non-firearm certificate holder providing?",A:"They must be over 14 years of age and resident on the land in question",B:"They must be over 16 years of age and the usage is for sporting purposes",C:"They must be over 18 years, not be a \"prohibited person\" and must be in your presence when using the rifle",D:"They can be of any age but must be resident on the land over which you are planning to shoot",correct:"C"},
  {id:122,cat:"Law & firearms",q:"In Northern Ireland it is illegal to shoot any deer at night unless injured. How is \"Night\" defined in law?",A:"When you cannot read a car number plate at 25 metres",B:"Between one hour after sunset and one hour before sunrise",C:"During official \"lighting up time\" as published in the local newspapers",D:"Between 2000 hours GMT and 0800 hours GMT",correct:"B"},
  {id:123,cat:"Law & firearms",q:"Which type of rifle bullet must be used to cull deer in Northern Ireland?",A:"Soft point bullets of up to 90 grains",B:"Hollow point bullets of over 120 grains with a muzzle energy of 1650 ft/lbs",C:"An expanding bullet weighing not less than 100 grains designed to deform in a predictable manner upon entering tissue",D:"Full metal jacket bullets designed to tumble on impact and thereby increase the knock down effect on striking a deer",correct:"C"},
  {id:124,cat:"Zeroing & ballistics",q:"If a shot at a deer for no apparent reason misses or does not hit where expected, before shooting at another deer a responsible stalker should do what?",A:"Thump the rifle butt gently to settle the action back into its bedding",B:"Give the rifle a thorough cleaning and oiling",C:"Fire carefully at a target to check the rifle is still correctly zeroed",D:"Try a different bullet weight to see if things improve",correct:"C"},
  {id:125,cat:"Zeroing & ballistics",q:"If your rifle is zeroed \"spot on\" at 100 yards, approximately where will your shots at 200 yards go?",A:"A few inches high",B:"A few inches low",C:"15 inches low",D:"30 inches low",correct:"B"},
  {id:126,cat:"Zeroing & ballistics",q:"When taking a shot in the field it is good practice and an aid to accuracy?",A:"To rest the barrel of your rifle on top of a hard surface for support",B:"To push the barrel of your rifle up against a fence wire for support",C:"To push the barrel of your rifle sideways against a tree for support",D:"To place the hand holding the fore-stock between a firm surface and the stock for support",correct:"D"},
  {id:127,cat:"Zeroing & ballistics",q:"Before zeroing your rifle what should you do?",A:"Clean the bore and check the bedding and mounting screws are tight",B:"Alter trigger pressure to maximum",C:"Oil the bore and ammunition lightly and release the bedding screws half a turn",D:"Alter the trigger pressure to minimum",correct:"A"},
  {id:128,cat:"Zeroing & ballistics",q:"If your rifle is shooting 3 inches left when you sight in at 25 yards, at 100 yards where will it shoot?",A:"3 inches left",B:"6 inches left",C:"9 inches left",D:"12 inches left",correct:"D"},
  {id:129,cat:"Zeroing & ballistics",q:"If firing at a deer 100 yards away with a strong 30 mph wind blowing from left to right and you have to take the shot, where should you aim?",A:"3 inches right",B:"3 inches left",C:"At the usual place",D:"In the centre of the body to ensure a hit",correct:"B"},
  {id:130,cat:"Zeroing & ballistics",q:"Continental or metric rifle calibres are often described with two numbers e.g. 6.5 x 57; 7 x 57; 7 x 64. What does the second figure refer to?",A:"The amount of powder in grains",B:"The bullet weight in grains",C:"The case length in millimetres",D:"Barrel length in centimetres",correct:"C"},
  {id:131,cat:"Zeroing & ballistics",q:"If, on a telescopic sight one click of the adjustment knob will move the bullet impact 1 centimetre at 100 metres. How far will bullet impact move per click at 25 metres?",A:"¼ centimetre",B:"1 centimetre",C:"2 centimetres",D:"8 centimetres",correct:"A"},
  {id:132,cat:"Zeroing & ballistics",q:"Define what zeroing a rifle and telescopic sight involves?",A:"Adjusting your sight so that your aim coincides with your group at a chosen range",B:"Moving the sight adjustment knobs to zero before firing a test group",C:"Aligning the bore with a collimator",D:"Ensuring the rifle shoots small groups",correct:"A"},
  {id:133,cat:"Zeroing & ballistics",q:"If you leave oil in your barrel what is likely to happen to your first shot at 100 metres?",A:"It will go to the point where the rifle is normally zeroed",B:"It will go exactly where you aim",C:"It will go somewhere other than where the rifle is normally zeroed",D:"It will decrease wear and tear on the barrel",correct:"C"},
  {id:134,cat:"Zeroing & ballistics",q:"What is the spin imparted to a bullet by the rifling intended to do?",A:"Increase its velocity",B:"Improve its stability in flight",C:"Help its penetration on the target",D:"Increase the muzzle energy",correct:"B"},
  {id:135,cat:"Zeroing & ballistics",q:"What is the definition of the term \"headspace\"?",A:"The distance between your head and the telescopic sight on your rifle, when the reticule is in focus",B:"The distance between the closed bolt face and a datum point on the chambered cartridge case",C:"The size of a deer's head in relation to the reticule",D:"The distance between the firing pin and the primer when the rifle is cocked",correct:"B"},
  {id:136,cat:"Zeroing & ballistics",q:"Describe what a bullet's trajectory is?",A:"The height of the bullet above the line of sight at half the zeroed range",B:"The height of the bullet above the line of sight at twice the zeroed range",C:"The path of the bullet in flight",D:"The drop below the line of sight after zero range has been reached",correct:"C"},
  {id:137,cat:"Zeroing & ballistics",q:"You are offered some ammunition hand loaded by a stalker which he finds performs well in his rifle. What should you do?",A:"Test the ammunition when you next go to the range",B:"Politely refuse the offer",C:"Disassemble the round to check the components",D:"Place an order for another 100 rounds",correct:"B"},
  {id:138,cat:"Zeroing & ballistics",q:"Obturation is necessary to form an effective seal between the cartridge case and the chamber of your rifle. How might an ineffective seal be indicated?",A:"A misfire",B:"Black streaks from the neck down the outside of the case",C:"Flattened primer",D:"Excessive flash from muzzle",correct:"B"},
  {id:139,cat:"Species: Roe",q:"Following the roe rut there is a delay before any fertilised eggs implant in the wall of the uterus and develop. When would you normally expect to see at least one foetus in the womb of a pregnant doe?",A:"Mid September-October",B:"Mid October-November",C:"Mid November-December",D:"Mid December-January",correct:"D"},
  {id:140,cat:"Species: Roe",q:"When is a roe buck's testosterone levels highest?",A:"January",B:"May",C:"July",D:"October",correct:"C"},
  {id:141,cat:"Species: Roe",q:"Scrapes below a fraying stock are associated with the territorial marking behaviour by the male of which of the following deer species?",A:"Fallow deer",B:"Sika deer",C:"Roe deer",D:"Red deer",correct:"C"},
  {id:142,cat:"Species: Roe",q:"When do mature roe bucks usually start to clean the velvet from their antlers?",A:"By the end of December",B:"By the end of January",C:"By the end of March",D:"By the end of May",correct:"C"},
  {id:143,cat:"Species: Roe",q:"Which of the following deer species has no visible tail?",A:"Red deer",B:"Roe deer",C:"Muntjac deer",D:"Fallow deer",correct:"B"},
  {id:144,cat:"Species: Roe",q:"What are the rough knobbles running up the majority of mature roe buck antlers called?",A:"Coronets",B:"Pearling",C:"Pedicles",D:"Beams",correct:"B"},
  {id:145,cat:"Species: Roe",q:"Which of the following female deer species frequently has twins?",A:"Red deer",B:"Fallow deer",C:"Roe deer",D:"Muntjac deer",correct:"C"},
  {id:146,cat:"Species: Roe",q:"Delayed implantation of the fertilised egg is associated with which deer species?",A:"Muntjac deer",B:"Chinese water deer",C:"Roe deer",D:"Sika deer",correct:"C"},
  {id:147,cat:"Species: Roe",q:"At what time of the year do most roe bucks cast their antlers?",A:"April/May",B:"September/October",C:"November/December",D:"February/March",correct:"C"},
  {id:148,cat:"Species: Roe",q:"In which month are most roe kids born?",A:"March/April",B:"April/May",C:"May/June",D:"June/July",correct:"C"},
  {id:149,cat:"Species: Roe",q:"Roe bucks and does tend to defend a territory throughout the summer months. Under normal circumstances which is most likely?",A:"For a buck's territory to overlap with that of another buck",B:"For a buck's territory to be the same size and shape throughout its life",C:"For a buck to hold a territory trying to exclude all other mature bucks",D:"For a doe to hold an exclusive territory trying to exclude all other does including the kids of that year",correct:"C"},
  {id:150,cat:"Species: Roe",q:"In what month does the roe rut usually begin?",A:"July",B:"August",C:"September",D:"October",correct:"A"},
  {id:151,cat:"Species: Roe",q:"In winter you see a roe deer without antlers but showing a downward projecting tuft of hair below the rump patch (caudal disc). What does this indicate?",A:"A buck who has shed or not yet grown antlers",B:"A hummel roe buck",C:"A buck kid which has not yet become fertile",D:"A doe",correct:"D"},
  {id:152,cat:"Species: Roe",q:"What are the best weather conditions for calling roe bucks during the rut?",A:"Humid and still",B:"Cool and breezy",C:"Heavy rain and wind",D:"Foggy",correct:"A"},
  {id:153,cat:"Species: Roe",q:"The white throat markings found on some roe deer are called?",A:"Blazers",B:"Collars",C:"Gorget patches",D:"Throat glands",correct:"C"},
  {id:154,cat:"Species: Roe",q:"What is the normal reaction if a roe is frightened and runs off?",A:"It usually sticks its tail straight up in the air",B:"Its white rump patch is usually fluffed out",C:"It whistles as a warning to other deer",D:"It hides its white rump patch to confuse predators",correct:"B"},
  {id:155,cat:"Species: Roe",q:"In the summer, you see a small deer without antlers look at you over a bush. It has pointed ears which are rimmed in black and a muzzle with white patches on its chin and upper lips. What is it?",A:"A muntjac doe",B:"A chinese water deer",C:"A fallow doe",D:"A roe doe",correct:"D"},
  {id:156,cat:"Species: Roe",q:"Which of the following best describes the behaviour of newly born roe deer kids?",A:"They follow the doe closely as soon as they are born",B:"They are closely guarded by the buck while the doe feeds",C:"They run away swiftly if discovered the first week after birth",D:"They are left hidden between feeds by their mother until strong enough to follow her",correct:"D"},
  {id:157,cat:"Species: Roe",q:"How is roe deer rutting activity frequently initiated?",A:"By the doe enticing the buck to follow her until mating can take place",B:"By the buck moving into the doe's herd feeding ground",C:"By bucks and their rutting stands barking at the does",D:"By does coming into season within days of giving birth",correct:"A"},
  {id:158,cat:"Species: Roe",q:"During which month would you observe your roe deer to determine the previous year's recruitment to the population?",A:"October",B:"March",C:"June",D:"August",correct:"B"},
  {id:159,cat:"Species: Roe",q:"In summer you see saplings frayed at 30-70 centimetres above ground level and an associated triangular scrape. This is most likely to have been done by male deer of which species?",A:"Red",B:"Fallow",C:"Chinese water",D:"Roe",correct:"D"},
  {id:160,cat:"Species: Roe",q:"What is the minimum recommended height of tree shelter to be used in new plantations where roe deer are the only species present?",A:"0.4 metre",B:"1.5 metres",C:"0.9 metres",D:"1.2 metres",correct:"D"},
  {id:161,cat:"Species: Roe",q:"A male roe buck kid which develops and casts very small knob antler in its first winter is called?",A:"A spiker",B:"A button-buck",C:"A royal",D:"A staggie",correct:"B"},
  {id:162,cat:"Species: Roe",q:"In late winter, roe deer:",A:"Are seen in larger mixed sex groups",B:"Remain as solitary individuals",C:"Form all male groups",D:"Form all female groups",correct:"A"},
  {id:163,cat:"Species: Roe",q:"When do most roe does eject their last season's kids?",A:"January",B:"February",C:"April",D:"July",correct:"C"},
  {id:164,cat:"Species: Roe",q:"How many points does EACH antler of a typical mature roe buck have?",A:"1 point",B:"3 points",C:"6 points",D:"12 points",correct:"B"},
  {id:165,cat:"Species: Roe",q:"Between March and August, mature roe bucks are generally?",A:"Territorial",B:"Herding",C:"Wide-ranging",D:"Nomadic",correct:"A"},
  {id:166,cat:"Species: Roe",q:"How is the feeding pattern of roe deer generally described?",A:"Bulk",B:"Omnivorous",C:"Grazing",D:"Selective",correct:"D"},
  {id:167,cat:"Species: Roe",q:"Which of the following mature female deer is territorial during the summer months?",A:"Sika",B:"Roe",C:"Red",D:"Fallow",correct:"B"},
  {id:168,cat:"Species: Roe",q:"The natural life-span of a roe deer is usually no longer than?",A:"10 years",B:"15 years",C:"4 years",D:"5 years",correct:"A"},
  {id:169,cat:"Species: Fallow",q:"\"Pronking\" is a gait usually associated with which species of deer?",A:"Roe",B:"Fallow",C:"Red",D:"Chinese water deer",correct:"B"},
  {id:170,cat:"Species: Fallow",q:"The female deer of which species is correctly called a doe as opposed to a hind or cow?",A:"Red deer",B:"Fallow deer",C:"Sika deer",D:"Reindeer",correct:"B"},
  {id:171,cat:"Species: Fallow",q:"A pronounced hanging \"tassel\" and \"Adam's apple\" are associated with the males of which of the following deer species?",A:"Red deer",B:"Sika deer",C:"Fallow deer",D:"Roe deer",correct:"C"},
  {id:172,cat:"Species: Fallow",q:"Mature fallow bucks usually carry antlers which are?",A:"Narrow and eight pointed",B:"Wide and flattened or palmated",C:"Wide, round and multi pointed",D:"Short stubby and six pointed",correct:"B"},
  {id:173,cat:"Species: Fallow",q:"How would you describe the rump markings of a \"common\" variety of fallow deer?",A:"A white disc with black horseshoe-shaped mark round the upper side and a broad black stripe on the tail",B:"A white disc with pale brown horseshoe-shaped mark round the upper side and a white tail",C:"A pale ginger rump with no markings",D:"A pale yellow rump which stretches well up the back",correct:"A"},
  {id:174,cat:"Species: Fallow",q:"What does the call of a rutting fallow buck on his stand sound like?",A:"A sharp single bark that is not repeated",B:"A terrier like bark repeated continuously",C:"A whistle rising and falling in pitch",D:"A rhythmic belching noise repeated continuously for some minutes",correct:"D"},
  {id:175,cat:"Species: Fallow",q:"The male of which deer species usually holds a rutting \"stand\"?",A:"Red deer",B:"Chinese water deer",C:"Muntjac deer",D:"Fallow deer",correct:"D"},
  {id:176,cat:"Species: Fallow",q:"When are the majority of fallow fawns born?",A:"April",B:"May",C:"June",D:"August",correct:"C"},
  {id:177,cat:"Species: Fallow",q:"When is the peak of the fallow rut?",A:"May",B:"July/August",C:"October/November",D:"December",correct:"C"},
  {id:178,cat:"Species: Fallow",q:"The adult coat of which of the following species usually displays many white spots in the summer?",A:"Roe deer",B:"Fallow deer",C:"Muntjac deer",D:"Red deer",correct:"B"},
  {id:179,cat:"Species: Fallow",q:"In the spring fallow deer are usually found?",A:"In groups comprising a mix of all age groups and both sexes",B:"In groups containing either young or old animals but seldom both",C:"In groups with the does and fawns living separately from the older bucks",D:"As single animals or a doe and fawn but seldom in groups",correct:"C"},
  {id:180,cat:"Species: Fallow",q:"In what month do the majority of fallow bucks usually start to shed their velvet?",A:"July",B:"August",C:"September",D:"October",correct:"B"},
  {id:181,cat:"Species: Fallow",q:"What is the correct name for black coloured fallow deer?",A:"Menil",B:"Common",C:"Melanistic",D:"Blue coats",correct:"C"},
  {id:182,cat:"Species: Fallow",q:"What colour are the caudal markings and back stripe on menil fallow?",A:"Black",B:"Dark grey",C:"Light brown",D:"Pink",correct:"C"},
  {id:183,cat:"Species: Fallow",q:"Compared to sika deer, fallow deer have:",A:"A longer tail",B:"A shorter tail",C:"A similar length of tail",D:"No tail at all",correct:"A"},
  {id:184,cat:"Species: Fallow",q:"The top points along the palm of a fallow buck's antlers are called?",A:"Spellers",B:"Tops",C:"Pearls",D:"Offers",correct:"A"},
  {id:185,cat:"Species: Fallow",q:"For the rut the neck of a fallow buck looks much thicker because?",A:"A mane has grown",B:"Neck muscles have enlarged",C:"Fat has been deposited under the skin",D:"The skin has become very much thicker",correct:"B"},
  {id:186,cat:"Species: Fallow",q:"With which other species will fallow deer hybridise?",A:"Red",B:"Sika",C:"Roe",D:"None of the above",correct:"D"},
  {id:187,cat:"Species: Fallow",q:"Which of these species seldom has upper canine teeth when mature?",A:"Red",B:"Muntjac",C:"Fallow",D:"Sika",correct:"C"},
  {id:188,cat:"Species: Fallow",q:"The complete permanent dentition of a fallow deer consists of how many teeth?",A:"30",B:"32",C:"36",D:"38",correct:"B"},
  {id:189,cat:"Species: Fallow",q:"Which of these deer form large social groups?",A:"Muntjac",B:"Roe",C:"Chinese water",D:"Fallow",correct:"D"},
  {id:190,cat:"Species: Fallow",q:"Male fallow deer have usually left their mother's social group by the age of?",A:"9 months",B:"12 months",C:"18 months",D:"2 years",correct:"D"},
  {id:191,cat:"Species: Fallow",q:"During the rut fallow bucks:",A:"Gorge themselves to put on weight",B:"Spend more time than usual lying around in all male groups",C:"Feed much less than usual",D:"Develop thin scrawny necks",correct:"C"},
  {id:192,cat:"Species: Fallow",q:"By what age do fallow deer generally attain a full set of erupted permanent teeth?",A:"11-13 months",B:"16-19 months",C:"24-30 months",D:"34-38 months",correct:"C"},
  {id:193,cat:"Species: Fallow",q:"A fallow buck is killed in autumn. The end of the penis sheath is black/brown and looks like dry cracked earth. What is this a sign of?",A:"Venereal disease",B:"Normal rutting condition",C:"Congenital abnormality",D:"Infection after damaging the skin",correct:"B"},
  {id:194,cat:"Species: Red",q:"Which of the following species of deer is considered native to the British Isles i.e. resident in these Isles since the Ice Age?",A:"Red",B:"Sika",C:"Fallow",D:"Reindeer",correct:"A"},
  {id:195,cat:"Species: Red",q:"The male of which of the following species \"roars\" during the rut?",A:"Roe deer",B:"Red deer",C:"Fallow deer",D:"Sika deer",correct:"B"},
  {id:196,cat:"Species: Red",q:"What type of antler growth does a red deer \"hummel\" have?",A:"Only one antler",B:"No antlers",C:"Two antlers without any points above the brow tines",D:"Spikes covered in sponge velvet",correct:"B"},
  {id:197,cat:"Species: Red",q:"A yeld red hind is one which has?",A:"Twin calves at heel that year",B:"One calf that year and a follower from the year before at heel",C:"No calf being suckled that year",D:"One calf being suckled that year",correct:"C"},
  {id:198,cat:"Species: Red",q:"To what is the term \"knobber\" in red deer attributed to?",A:"A mature stag which never grows antlers",B:"A young stag growing his first antlers",C:"An old stag who has shed his antlers early",D:"A stag which cannot shed the velvet off his antlers",correct:"B"},
  {id:199,cat:"Species: Red",q:"Mature highland red stags and hinds:",A:"Form separate single sex herds except during the rut",B:"Occupy the same core area and remain in mixed herds all the year",C:"Can be found in mixed herds but only on the best feeding areas in the summer",D:"Pair for life and are usually found together",correct:"A"},
  {id:200,cat:"Species: Red",q:"The male of which of the following species grows a mane in the rut?",A:"Red deer",B:"Roe deer",C:"Fallow deer",D:"Muntjac deer",correct:"A"},
  {id:201,cat:"Species: Red",q:"The majority of highland red deer when resting:",A:"Usually lie down watching uphill",B:"Usually lie down watching downhill",C:"Don't appear to favour any direction",D:"Turn round constantly to keep a look-out in all directions",correct:"B"},
  {id:202,cat:"Species: Red",q:"When feeding on the open hill red deer:",A:"Generally keep their backs to the wind",B:"Keep their heads into the wind",C:"Often do so lying down to stay out of the wind",D:"Have no special feeding pattern",correct:"B"},
  {id:203,cat:"Species: Red",q:"What is the feeding pattern of mature red stags during the peak of the rut?",A:"They feed heavily all the time to keep up their strength",B:"They feed at night when rutting activity stops",C:"They feed very little and lose weight",D:"They feed by day but are guarding their hinds at night",correct:"C"},
  {id:204,cat:"Species: Red",q:"When do the majority of red stags normally cast their antlers?",A:"December-February",B:"March-May",C:"May-July",D:"September-November",correct:"B"},
  {id:205,cat:"Species: Red",q:"In what month is the usual peak of the red deer rut?",A:"August",B:"October",C:"November",D:"December",correct:"B"},
  {id:206,cat:"Species: Red",q:"How would you best describe the rump patch of red deer in winter coat?",A:"It is yellowish and runs up onto the back above the tail",B:"It is more prominently white than roe or sika",C:"It is surrounded by a prominent black border",D:"It has a black stripe down the tail",correct:"A"},
  {id:207,cat:"Species: Red",q:"In daytime during July/August in Scotland, highland red stags are usually found:",A:"In stag herds on the low grounds where there is good feeding",B:"In stag herds on the high ground",C:"In mixed herds with the hinds",D:"Alone on the river flats feeding to put on fat",correct:"B"},
  {id:208,cat:"Species: Red",q:"What is the general movement pattern of open hill red deer?",A:"They move to higher ground during the hours of darkness",B:"They move to lower ground during the hours of darkness",C:"They change their range very little day or night",D:"They never move at night",correct:"B"},
  {id:209,cat:"Species: Red",q:"Which of the following statements best describes the damage inflicted on trees by red deer?",A:"Red deer eat tree bark by stripping it off using their lower incisors",B:"Red deer cannot eat bark because they have no upper incisors",C:"Red deer never damage tree bark, they only eat shoots",D:"Red deer only damage bark by thrashing with antlers",correct:"A"},
  {id:210,cat:"Species: Red",q:"When are most highland red deer calves born?",A:"April",B:"June",C:"July",D:"August",correct:"B"},
  {id:211,cat:"Species: Red",q:"How many offspring will wild red deer hinds produce?",A:"They will often bear twin calves",B:"They will usually bear twin calves",C:"They will very rarely bear twin calves",D:"They will never bear twin calves",correct:"C"},
  {id:212,cat:"Species: Red",q:"At what distance can red deer detect human wind-borne scent?",A:"No more than 100 yards",B:"No more than 500 yards",C:"No more than 800 yards",D:"Over a mile under certain conditions",correct:"D"},
  {id:213,cat:"Species: Red",q:"Wallowing by red deer?",A:"Is done by both stags and hinds",B:"Is done only by stags",C:"Is done only by hinds",D:"Is only rarely done and never in daylight",correct:"A"},
  {id:214,cat:"Species: Red",q:"In red deer, a \"Royal\" head is?",A:"14 points with 4 in a \"crown\" on each top",B:"12 points with 3 in a \"crown\" on each top",C:"10 points with a good fork on each top",D:"20 points with 10 on each antler",correct:"B"},
  {id:215,cat:"Species: Red",q:"After having bred once, a highland red hind is likely to?",A:"Bear a calf every year without fail",B:"Occasionally miss a year and not bear a calf",C:"Bear a calf at any time of the year",D:"Bear a calf only if there are plenty of stags around",correct:"B"},
  {id:216,cat:"Species: Red",q:"During the red deer rut, the most hinds are likely to be held by:",A:"The lighter faster stags",B:"The young energetic stags",C:"The stags with the most points on their antlers",D:"The heaviest stags with the best body condition",correct:"D"},
  {id:217,cat:"Species: Red",q:"What is indicated by a red deer which watches intently and stamps its foot?",A:"It is trying to dominate a younger animal close by",B:"It is suspicious at something seen, but not identified",C:"It is stirring up the peat prior to wallowing",D:"It is trying to shake off ticks",correct:"B"},
  {id:218,cat:"Species: Red",q:"When do red stags usually stand on their hind legs and box with their forefeet?",A:"At the height of the rut",B:"After they have cast their antlers",C:"When at a winter feed site",D:"When dominating a hind",correct:"B"},
  {id:219,cat:"Species: Red",q:"If a red deer calf is orphaned early in the open hind season, might it?",A:"Survive well because it is independent of its dam",B:"Pine away for lack of parental attention",C:"Be adopted and fed by another hind",D:"Be taken by a mature stag to join the stag herd",correct:"B"},
  {id:220,cat:"Species: Red",q:"What best describes a red hind's alarm call?",A:"A deep bark",B:"A loud sharp squeal",C:"A short whistle",D:"A low whicker",correct:"A"},
  {id:221,cat:"Species: Red",q:"How is a newly-born red deer calf coloured?",A:"Pale ginger all over",B:"Covered in black woolly fur",C:"Chestnut coloured with dappled white spots",D:"Just like a miniature adult in colour",correct:"C"},
  {id:222,cat:"Species: Red",q:"Which of the following best describes the behaviour pattern within a red deer hind herd?",A:"There is a definite pecking order of dominance",B:"All animals are equal and share feeding",C:"The lightest and quickest animals are dominant",D:"Calves are always allowed to take precedence",correct:"A"},
  {id:223,cat:"Species: Red",q:"In order to contain or exclude red deer an effective fence should be?",A:"1 metre high",B:"1.3 metres high",C:"1.7 metres high",D:"2 metres high",correct:"D"},
  {id:224,cat:"Species: Sika",q:"To which species are sika deer most closely related to?",A:"Red deer",B:"Roe deer",C:"Fallow deer",D:"Muntjac deer",correct:"A"},
  {id:225,cat:"Species: Sika",q:"Which colour configuration do Japanese sika hinds appear to have in winter coat?",A:"A golden brown colour all over",B:"A two-tone colouring chestnut brown on top mushroom grey below",C:"A fresh red and white dappled coat",D:"A drab sooty grey colour all over with paler underbelly",correct:"D"},
  {id:226,cat:"Species: Sika",q:"Sika hinds usually?",A:"Give birth to a single calf",B:"Give birth to twins",C:"Do not breed till they are three years old",D:"Have multiple births",correct:"A"},
  {id:227,cat:"Species: Sika",q:"What colour is the velvet covering the antlers of Japanese sika stags?",A:"Dark red",B:"Pale brown",C:"Black",D:"Russet",correct:"C"},
  {id:228,cat:"Species: Sika",q:"The metatarsal gland on the outer side of the hock of a mature Japanese sika deer is?",A:"Conspicuous, 2 inch long and white or pale grey in colour",B:"Darker than the rest of the hock",C:"Very hairy and gummed up with secretions",D:"Not easy to see at all",correct:"A"},
  {id:229,cat:"Species: Sika",q:"When are most sika calves born?",A:"April",B:"June",C:"August",D:"October",correct:"B"},
  {id:230,cat:"Species: Sika",q:"Which species are sika deer closest in size to?",A:"Red deer",B:"Fallow deer",C:"Roe deer",D:"Muntjac deer",correct:"B"},
  {id:231,cat:"Species: Sika",q:"How many points on their antlers do mature Japanese sika stags normally have?",A:"2 point heads",B:"4 point heads",C:"8 point heads",D:"12 plus point heads",correct:"C"},
  {id:232,cat:"Species: Sika",q:"What is the colour of Japanese sika deer's summer coat?",A:"Black and brown with faint spots",B:"Nondescript grey and pale belly",C:"Chestnut with white spots and pale belly",D:"Foxy red all over",correct:"C"},
  {id:233,cat:"Species: Sika",q:"Which deer gives a repeated rising and falling whistle in the rut?",A:"Muntjac deer",B:"Roe deer",C:"Sika deer",D:"Red deer",correct:"C"},
  {id:234,cat:"Species: Sika",q:"A deer which has a pronounced \"U\" or \"V\" shaped pale line across its brows and frowns when it looks at you is likely to be what?",A:"A chinese water deer",B:"A fallow deer",C:"A red deer",D:"A sika deer",correct:"D"},
  {id:235,cat:"Species: Sika",q:"When do most mature sika stags cast their antlers?",A:"January",B:"March",C:"May",D:"June",correct:"B"},
  {id:236,cat:"Species: Sika",q:"How is a sika stags rutting activity in woodland best described?",A:"Herding hinds into a harem",B:"Using a rutting stand to attract hinds",C:"Defence of a territory",D:"A mixture of all three strategies",correct:"D"},
  {id:237,cat:"Species: Sika",q:"How is sika deer feeding behaviour best described?",A:"Mainly browsing",B:"Only grazing",C:"A mixture of browsing and grazing",D:"Subsisting on tree bark",correct:"C"},
  {id:238,cat:"Species: Sika",q:"The word hind is correctly applied to the female of which of the following deer species?",A:"Roe deer",B:"Sika deer",C:"Fallow deer",D:"Muntjac",correct:"B"},
  {id:239,cat:"Species: Sika",q:"Which of the following species most obviously flares out the hair on its rump patch when alarmed?",A:"Fallow deer",B:"Sika deer",C:"Chinese water deer",D:"Red deer",correct:"B"},
  {id:240,cat:"Species: Sika",q:"Which of the following deer wallow most readily?",A:"Roe deer",B:"Muntjac deer",C:"Sika deer",D:"Chinese water deer",correct:"C"},
  {id:241,cat:"Species: Sika",q:"What is included in a territorial display typical of a sika stag in woodland?",A:"Roaming continuously during daylight hours",B:"Leaving piles of droppings on the rides surrounding their territories",C:"Scoring the bark of trees deeply with their antler points",D:"Chewing up fir cones and regurgitating the product at their territory boundaries",correct:"C"},
  {id:242,cat:"Species: Sika",q:"How do sika stags mark out territories in the rut?",A:"With wallows",B:"With scrapes in which they often urinate",C:"By bole scoring trees",D:"All of the above",correct:"D"},
  {id:243,cat:"Species: Sika",q:"On which coat do wild sika deer have readily visible white spots?",A:"Winter coat only",B:"Summer coat only",C:"Neither coat",D:"Both coats",correct:"B"},
  {id:244,cat:"Species: Sika",q:"A sika/red hybrid often shows traits of both species. Which characteristic if found on an adult red deer might suggest it is a sika/red hybrid?",A:"A yellowish rump patch",B:"A broad muzzle",C:"Long narrow hairy ears",D:"Prominent white (metatarsal) glands on outside of hocks",correct:"D"},
  {id:245,cat:"Species: Sika",q:"Which male deer sometimes shed \"milky tears\" during the rut?",A:"Roe deer",B:"Fallow deer",C:"Red deer",D:"Sika deer",correct:"D"},
  {id:246,cat:"Species: Sika",q:"How would you describe a sika hind's alarm call?",A:"A deep resounding bark",B:"A single loud bark",C:"A long wailing whistle",D:"A short sharp squeak",correct:"D"},
  {id:247,cat:"Species: Sika",q:"A mature sika stag typically:",A:"Lives a solitary life all year except during the rut",B:"Lives in a stag herd except during the rut",C:"Lives in a mixed age and sex group all year round",D:"Lives in a tight family group with a hind and her offspring year round",correct:"B"},
  {id:248,cat:"Species: Sika",q:"Tree bole scoring with antler points is predominantly done by which of the following species?",A:"Muntjac",B:"Roe",C:"Sika",D:"Fallow",correct:"C"},
  {id:249,cat:"Species: Muntjac",q:"From approximately what age are muntjac does able to conceive?",A:"14 months",B:"18 months",C:"12 months",D:"7 months",correct:"D"},
  {id:250,cat:"Species: Muntjac",q:"In what respect are adult muntjac bucks different from the males of native deer species?",A:"They have tusks that are visible externally",B:"They do not have antlers",C:"They have no visible tail",D:"Their ears are round and hairy",correct:"A"},
  {id:251,cat:"Species: Muntjac",q:"Which species of deer does not have a raised patch of hairs on the hocks?",A:"Sika",B:"Fallow",C:"Roe",D:"Muntjac",correct:"D"},
  {id:252,cat:"Species: Muntjac",q:"Which species of deer has scent glands at all of these sites: frontal, sub orbital, interdigital and in the reproductive tract?",A:"Fallow",B:"Muntjac",C:"Chinese water deer",D:"Roe",correct:"B"},
  {id:253,cat:"Species: Muntjac",q:"A mature muntjac buck's home range:",A:"Is a myth muntjac are not territorial",B:"Usually includes the home ranges of several females",C:"Changes radically with the seasons",D:"Is shared with a number of other mature bucks",correct:"B"},
  {id:254,cat:"Species: Muntjac",q:"Which of these foods is least preferred by muntjac?",A:"Buds and leaves of deciduous shrubs",B:"Flowers",C:"Conifer leaves",D:"Fungi",correct:"C"},
  {id:255,cat:"Species: Muntjac",q:"By what age have muntjac fawns virtually lost their spots?",A:"One month",B:"Two months",C:"Three months",D:"Four months",correct:"B"},
  {id:256,cat:"Species: Muntjac",q:"What is the typical live body weight for an adult female muntjac?",A:"8 kg",B:"12 kg",C:"16 kg",D:"18 kg",correct:"C"},
  {id:257,cat:"Species: Muntjac",q:"When do most mature Muntjac bucks cast their antlers?",A:"December/January",B:"February/March",C:"April/May",D:"August/September",correct:"C"},
  {id:258,cat:"Species: Muntjac",q:"A muntjac buck's first antlers",A:"Always have small coronets and brow tines",B:"Are usually simple thin spikes with no coronets or brow tines",C:"Are always long thick spikes with no brow tines",D:"Are cast on a date depending on the animals date of birth",correct:"B"},
  {id:259,cat:"Species: Muntjac",q:"Muntjac are:",A:"Seldom seen alone",B:"Usually seen in ones and twos",C:"Usually seen in small herds",D:"Usually seen in large herds",correct:"B"},
  {id:260,cat:"Species: Muntjac",q:"Which of these male deer might be seen mating when they have just cast their antlers?",A:"Roe",B:"Sika",C:"Muntjac",D:"Fallow",correct:"C"},
  {id:261,cat:"Species: Muntjac",q:"How often can muntjac females bare a fawn?",A:"Once a year in February",B:"Twice a year in June and December",C:"Every three months",D:"Every seven months",correct:"D"},
  {id:262,cat:"Species: Muntjac",q:"What noise do mature muntjac make when suspicious or disturbed?",A:"A shrill sharp squeak",B:"A high pitched repetitive bark",C:"A single deep bark",D:"A triple toned whistle",correct:"B"},
  {id:263,cat:"Species: Muntjac",q:"What is the typical antler configuration for the adult male muntjac?",A:"No antlers",B:"Long palmated antlers",C:"Short hooked antlers",D:"6 point stubby antlers",correct:"C"},
  {id:264,cat:"Species: Muntjac",q:"What is the normal period between the birth of a muntjac fawn and the end of lactation?",A:"About 2 months",B:"About 6 months",C:"About 7 months",D:"About 9 months",correct:"A"},
  {id:265,cat:"Species: Muntjac",q:"A small deer runs away from you in thick cover with its tail straight up in the air the underside is pure white. Which species is it likely to be?",A:"Muntjac deer",B:"Roe deer",C:"Chinese water deer",D:"Red deer",correct:"A"},
  {id:266,cat:"Species: Muntjac",q:"Why is a heavily pregnant female muntjac an ideal class to cull?",A:"Because they will not have a dependant fawn",B:"Because their venison is the most tender",C:"Because they are less wary so easier to stalk",D:"Because they spend more time in the open",correct:"A"},
  {id:267,cat:"Species: Muntjac",q:"Which species of deer breed regularly throughout the year?",A:"Muntjac",B:"Red",C:"Sika",D:"Chinese water deer",correct:"A"},
  {id:268,cat:"Species: Muntjac",q:"How would you describe the colour of an adult muntjac in summer coat?",A:"It is heavily spotted all over",B:"It has a row of spots either side of the spine",C:"It has a dark grey coat with black markings",D:"It is a chestnut colour brown with white under parts",correct:"D"},
  {id:269,cat:"Species: Muntjac",q:"During which period are muntjac born?",A:"All through the year",B:"December-March",C:"April-May",D:"The month of July",correct:"A"},
  {id:270,cat:"Species: Muntjac",q:"During which period are muntjac bucks fertile?",A:"All through the year",B:"June-August",C:"December-March",D:"October-November",correct:"A"},
  {id:271,cat:"Species: Muntjac",q:"A muntjac seen in velvet in December is probably?",A:"Growing his first antlers",B:"Very old",C:"In poor health",D:"A typical adult",correct:"A"},
  {id:272,cat:"Species: Muntjac",q:"Which species of deer in UK has black lines and bony ridges running from its eyes to its antler bases?",A:"Sika deer",B:"Muntjac deer",C:"Chinese water deer",D:"Fallow deer",correct:"B"},
  {id:273,cat:"Species: Muntjac",q:"During which period of the year are muntjac antlers normally cast?",A:"December/January",B:"February/March",C:"April/May",D:"October/November",correct:"C"},
  {id:274,cat:"Species: Chinese Water Deer",q:"Which of these species has the most limited distribution in Britain?",A:"Sika",B:"Chinese water deer",C:"Muntjac",D:"Fallow",correct:"B"},
  {id:275,cat:"Species: Chinese Water Deer",q:"Which species of deer are associated with reed-bed habitats?",A:"Sika",B:"Fallow",C:"Chinese water deer",D:"Muntjac",correct:"C"},
  {id:276,cat:"Species: Chinese Water Deer",q:"Which species of deer has hind legs that appear to be longer than their forelegs?",A:"Fallow deer",B:"Roe deer",C:"Chinese water deer",D:"Sika deer",correct:"C"},
  {id:277,cat:"Species: Chinese Water Deer",q:"Which species of male deer has prominent tusks and no antlers?",A:"Muntjac deer",B:"Roe deer",C:"Chinese water deer",D:"Sika deer",correct:"C"},
  {id:278,cat:"Species: Chinese Water Deer",q:"Which species of deer has scent glands in the groin (inguinal glands)?",A:"Fallow",B:"Sika",C:"Chinese water deer",D:"Roe",correct:"C"},
  {id:279,cat:"Species: Chinese Water Deer",q:"A deer is described to you as having black button eyes and nose with round ears, resembling a teddy bear. What species of deer is it likely to be?",A:"Chinese water deer",B:"Roe deer",C:"Muntjac deer",D:"Fallow deer",correct:"A"},
  {id:280,cat:"Species: Chinese Water Deer",q:"During which month do Chinese water deer rut?",A:"July",B:"September",C:"October",D:"December",correct:"D"},
  {id:281,cat:"Species: Chinese Water Deer",q:"Chinese water deer usually give birth during the period of?",A:"March/April",B:"May/June",C:"August/September",D:"All year round",correct:"B"},
  {id:282,cat:"Species: Chinese Water Deer",q:"Which species of deer often produce \"multiple births\" of three or more fawns?",A:"Roe deer",B:"Chinese water deer",C:"Muntjac deer",D:"Sika deer",correct:"B"},
  {id:283,cat:"Species: Chinese Water Deer",q:"Chinese water deer does may have their first fawns at the age of?",A:"Six months",B:"One year old",C:"Two years old",D:"Three years old",correct:"B"},
];
// ─── Deck config: order, colour, short label ────────────────────────────────
const WRITTEN_DECKS = [
  { cat: "General biology & behaviour", short: "Biology & behaviour", color: "#CCFF66" },
  { cat: "The shot & after", short: "The shot & after", color: "#FFCC33" },
  { cat: "Safety & fieldcraft", short: "Safety & fieldcraft", color: "#66CCFF" },
  { cat: "Law & firearms", short: "Law & firearms", color: "#FF6699" },
  { cat: "Zeroing & ballistics", short: "Zeroing & ballistics", color: "#FF9900" },
  { cat: "Species: Roe", short: "Species - Roe", color: "#B8E986" },
  { cat: "Species: Fallow", short: "Species - Fallow", color: "#E8B96A" },
  { cat: "Species: Red", short: "Species - Red", color: "#E8896A" },
  { cat: "Species: Sika", short: "Species - Sika", color: "#9A8CE8" },
  { cat: "Species: Muntjac", short: "Species - Muntjac", color: "#6AD5E8" },
  { cat: "Species: Chinese Water Deer", short: "Species - Chinese Water Deer", color: "#E86AB8" },
];

// ── Meat & hygiene track (DSC1 "Large Game" + FSA "Common hygiene") ──────────
// Two sources, all now answered — answerability is still handled PER QUESTION
// (a question is "answered" when `correct` is a real letter; "?" = unanswered):
//   • Deer (D1–D75) + Wild boar (W76–W86): from the DMQ "Industry Large Game
//     Questions 2022" paper (no printed key). Answers supplied by the owner and
//     carry a `conf` field — "High" (from course material) or "Medium" (<100%);
//     Medium answers show an "unverified" badge in the app.
//   • Hygiene (H1–H119): from the FSA "Common hygiene questions May 2022" paper,
//     whose correct option is highlighted yellow → treated as verified (no conf).
// `code` is the source question number; ids are unique within this track.
export const MEAT_QUESTIONS = [
  {id:1,code:"D1",cat:"Deer",q:"You stalk a deer that clearly sees you and does not take flight. Should you:",A:"Think you are a good stalker",B:"Leave it to get better",C:"Appreciating that this could be normal, even so suspect a diseased or wounded deer",D:"Shoot it and leave it to decay naturally",correct:"C",conf:"High"},
  {id:2,code:"D2",cat:"Deer",q:"A deer in the wild shows no fear of humans when approached. Is this:",A:"Because it has not seen you",B:"Normal behaviour in winter months only",C:"Normal behaviour for muntjac deer",D:"Abnormal Behaviour",correct:"D",conf:"Medium"},
  {id:3,code:"D3",cat:"Deer",q:"A herd of deer in woodland have become used to human activity such as walkers and during the culling of these deer you can stalk in very close to these animals. Is this:",A:"Abnormal behaviour for deer in the closed season",B:"Normal behaviour for deer in the closed season",C:"Normal behaviour for these deer",D:"Abnormal behaviours at any time of year",correct:"C",conf:"High"},
  {id:4,code:"D4",cat:"Deer",q:"A roe deer senses you as you stalk through the wood and takes flight. Is this:",A:"Normal behaviour",B:"Abnormal behaviour",C:"Unusual for roe deer",D:"Normal as it is female",correct:"A",conf:"High"},
  {id:5,code:"D5",cat:"Deer",q:"A red deer stag in October is seen chasing other deer, roaring, fighting and constantly urinating over itself. Is this behaviour:",A:"Abnormal - a probable sign of rabies",B:"Normal – they act like this all year round",C:"Normal – it is typical rutting behaviours",D:"Abnormal - a probable sign of a brain disease/Spongiform Encephalopathy",correct:"C",conf:"High"},
  {id:6,code:"D6",cat:"Deer",q:"In late July a roe buck is seen chasing a doe round and round a tree stump. Is this behaviour:",A:"Normal – it is typical rutting behaviours",B:"Abnormal - a probable sign of rabies",C:"Normal – roe bucks act like this all year round",D:"Abnormal - a probable sign of brain disease/Spongiform Encephalopathy",correct:"A",conf:"High"},
  {id:7,code:"D7",cat:"Deer",q:"A roe deer seen feeding on oilseed rape in winter appears to be blind and shows no fear of man. When it is dispatched the trained hunter should:",A:"Remove the head, pluck and label the carcass as correctly inspected",B:"Deliver the carcass to the dealer un-eviscerated and with head on",C:"Destroy the carcass as unfit for human consumption",D:"Deliver the carcass to the dealer with its pluck and head with a note of the circumstances",correct:"C",conf:"High"},
  {id:8,code:"D8",cat:"Deer",q:"Two stags are fighting- one gores the other in the eye and the injured animal is shot. What should be done with the carcass?",A:"It can only be sold if the injury is reported to the Animal and Plant Health Agency Service first",B:"It is unfit for human consumption due to the damaged eye",C:"It is unsafe to eat: no stag is injured fighting unless diseased or very old",D:"It can be sold into the food chain after inspection in the normal way",correct:"D",conf:"High"},
  {id:9,code:"D9",cat:"Deer",q:"Before a red deer stag is shot in late October, it appeared tired and listless. On inspection it has no fat, a shaggy coat covered in peat and urine and the hair on its belly is black and stinks. Are these symptoms:",A:"Abnormal signs suggesting Chronic Wasting Disease",B:"Normal signs at this time of year after rutting hard",C:"Normal in red deer - all wild stags are like this all the year round",D:"Highly abnormal - it must be a serious disease.",correct:"B",conf:"High"},
  {id:10,code:"D10",cat:"Deer",q:"A muntjac doe is shot on 10 December and is found about to give birth. Is this:",A:"Quite normal and pregnancy has no adverse effect on the meat.",B:"Highly abnormal and the carcass will not be safe to eat",C:"Abnormal caused by sickness during the normal breeding period",D:"Highly abnormal but there is no risk to human health",correct:"A",conf:"High"},
  {id:11,code:"D11",cat:"Deer",q:"A dead wild deer exhibits a large distended rumen (stomach) on inspection, after a lengthy follow up. Would you suspect the animal?",A:"Was dangerously infected with TB",B:"Was seriously infested with internal parasites",C:"Had been left too long before gralloching",D:"Had been over feeding on new growth",correct:"C",conf:"High"},
  {id:12,code:"D12",cat:"Deer",q:"Swollen lymph glands and solid lumps in the lungs could indicate:",A:"TB",B:"Hydraulic tissue damage from the bullet track",C:"A healthy deer",D:"An old deer",correct:"A",conf:"High"},
  {id:13,code:"D13",cat:"Deer",q:"Blisters on the lips, tongue and around and between the hooves could indicate:",A:"An old deer",B:"A healthy deer",C:"Foot & Mouth Disease",D:"A deer which lives in a damp wet area",correct:"C",conf:"High"},
  {id:14,code:"D14",cat:"Deer",q:"You shoot a deer which is limping. During carcass inspection you find small blisters between the hooves. You should:",A:"Report the condition by telephone to the Animal and Plant Health Agency without delay",B:"Put the whole carcass into your car and take it to the Animal and Plant Health Agency immediately",C:"Dispose of it by burying the carcass at least 1 meter below ground as you do not need to inform anybody even though you cannot use it",D:"Label the carcass as inspected recording the condition and send it to the dealer with its legs attached",correct:"A",conf:"Medium"},
  {id:15,code:"D15",cat:"Deer",q:"You inspect a deer carcass and find abnormal lymph nodes under the jaw and in the throat. This suggests:",A:"Bovine Tuberculosis",B:"Foot and mouth disease",C:"Tooth cavities and an ear infection",D:"Starvation",correct:"A",conf:"High"},
  {id:16,code:"D16",cat:"Deer",q:"The symptoms of anthrax include a grossly enlarged spleen and dark bleeding from every orifice. This disease:",A:"Is common in UK deer.",B:"Is not dangerous to man and can be safely ignored",C:"Should be suspected whenever a deer is found to be in poor condition",D:"Has never been reported in UK deer",correct:"D",conf:"High"},
  {id:17,code:"D17",cat:"Deer",q:"You witness a deer involved in a road traffic accident. With regard to food hygiene do you:",A:"Take the carcass to a game dealer",B:"Tell the driver of the car the carcass is ok to enter the food chain and he should sell the venison",C:"Inform the local Authority for them to dispose of it",D:"Offer to make sausages out of it for the driver",correct:"C",conf:"High"},
  {id:18,code:"D18",cat:"Deer",q:"A deer has a wound which has become fly blown and infected. This will:",A:"Make the meat tough",B:"Make the meat more tender",C:"Possibly contaminate the carcass and render it unfit for human consumption",D:"Always taint the whole carcass",correct:"C",conf:"High"},
  {id:19,code:"D19",cat:"Deer",q:"A deer which is very thin because it has not had enough to eat will be:",A:"Perhaps suitable to enter the food chain after close inspection by a trained hunter",B:"Good to eat because it does not have too much fat",C:"Difficult to cook",D:"Tender and tasty so it can be sold at a premium",correct:"A",conf:"Medium"},
  {id:20,code:"D20",cat:"Deer",q:"At winters end, deer are often thin due to lack of food. At other times of the year deer which are thin should be:",A:"Buried as soon as possible",B:"Sent to the dealer with others in the hope that it will be accepted",C:"Carefully examined and inspected to identify any possible cause",D:"Eaten at home because it will not fetch a good price.",correct:"C",conf:"High"},
  {id:21,code:"D21",cat:"Deer",q:"The surface of a roe liver has a mottled appearance with hard white lumps. This would suggest:",A:"The liver had been damaged by bullet fragments",B:"Liver Fluke",C:"A healthy deer",D:"An old deer",correct:"B",conf:"High"},
  {id:22,code:"D22",cat:"Deer",q:"A Roe liver has thick white lining to the bile ducts and leaf like parasites in the bile ducts. This would suggest:",A:"Liver Fluke",B:"The liver had been damaged by bullet fragments",C:"A healthy deer",D:"An old deer",correct:"A",conf:"High"},
  {id:23,code:"D23",cat:"Deer",q:"A carcass is found to have many white grubs under the skin along its back. What are these likely to be?",A:"Tick larvae",B:"Ked larvae",C:"Warble fly larvae",D:"Ring worm",correct:"C",conf:"High"},
  {id:24,code:"D24",cat:"Deer",q:"The nasal bot fly parasite:",A:"Is a major killer of young deer every year",B:"Causes little discomfort to its deer host",C:"Causes the deer persistent irritation and discomfort",D:"Is easily got rid of by rubbing on a tree or post",correct:"B",conf:"Medium"},
  {id:25,code:"D25",cat:"Deer",q:"Which of the following statements is true about warble fly in deer?",A:"It is found in red deer in Scotland",B:"It is found in all deer in Scotland",C:"It is common in red deer throughout the UK",D:"It is common in all deer throughout the UK",correct:"A",conf:"Medium"},
  {id:26,code:"D26",cat:"Deer",q:"Which of these external parasites can carry Lyme Disease?",A:"Lice",B:"Head flies",C:"Warble flies",D:"Ticks",correct:"D",conf:"High"},
  {id:27,code:"D27",cat:"Deer",q:"You find some flattened insects scuttling rapidly through the deer's hair. What are they?",A:"Lice",B:"Ticks",C:"Keds",D:"Bot flies",correct:"C",conf:"High"},
  {id:28,code:"D28",cat:"Deer",q:"Lung worms are often found in wild roe deer. Symptoms include:",A:"Clear cysts on the surface of the lungs",B:"Purple inflammation throughout the lungs",C:"Bleeding and clotted blood in the lung tissue",D:"Whitish/pale grey solid patches in the lung tissue especially at lower edges",correct:"D",conf:"Medium"},
  {id:29,code:"D29",cat:"Deer",q:"A red hind shot in Scotland in February has many white maggots under the skin on its back. These are:",A:"Warble fly larva – not dangerous to human health",B:"Round worms – dangerous to human health",C:"Bot fly – not dangerous to human health",D:"Tapeworms – dangerous to human health",correct:"A",conf:"High"},
  {id:30,code:"D30",cat:"Deer",q:"On inspecting a deer pluck you find the liver is mottled and puckered and has liver flukes in the bile ducts but otherwise it is in good condition? Should you:",A:"Reject the carcass and dispose of it correctly",B:"Sell the carcass to your dealer noting it had liver fluke on your declaration",C:"Immediately ring the Animal and Plant Health Agency to report this dangerous disease",D:"Send the carcass to the game dealer with its pluck",correct:"D",conf:"Medium"},
  {id:31,code:"D31",cat:"Deer",q:"A deer is shot in summer and has a very heavy tick burden. Should you:",A:"Treat the carcass in the normal way, if it is in normal condition, but try to avoid getting bitten by ticks yourself",B:"Reject the carcass as unfit for human consumption",C:"Spray the carcass with fly spray to kill the ticks",D:"Inform the Animal and Plant Health Agency",correct:"A",conf:"High"},
  {id:32,code:"D32",cat:"Deer",q:"Numerous small, flat insects with six legs are seen running through the deer's hair as it hangs in the larder. These are:",A:"Ticks – they suck blood and can carry diseases",B:"Keds – they are not dangerous to human health",C:"Lice – they may be a sign of ill-health in the deer",D:"Blow flies – your larder is not fly-proof",correct:"B",conf:"Medium"},
  {id:33,code:"D33",cat:"Deer",q:"You shoot a thin deer with a poor scruffy coat. On inspection, you find it is infested with small (2mm) reddish parasites with a dark line down their back. They are:",A:"Lice which have no food safety consequence but may indicate the deer is in poor condition",B:"Ticks which may bite humans but have no food safety consequence",C:"Keds which do not bite humans and have no food safety consequence",D:"Fleas which do not bite humans and have no food safety consequence",correct:"A",conf:"Medium"},
  {id:34,code:"D34",cat:"Deer",q:"When preparing a roe buck trophy after selling the carcass to a dealer. On cutting the skull, you find several white grubs in the animal's nasal passage. You should:",A:"Call the dealer and ask him to destroy the carcass immediately",B:"Call the Animal and Plant Health Agency and report the matter",C:"Do both a and b above",D:"Do nothing, as it signifies Nasal Bot Fly, which is not dangerous to human health.",correct:"D",conf:"High"},
  {id:35,code:"D35",cat:"Deer",q:"During inspection of the pluck, you find a clear, walnut-sized, cyst loosely attached to the liver. What following action should you take?",A:"Eat the carcass yourself and feed the offal to your dog",B:"Destroy the whole carcass as unfit for sale",C:"Retain the carcass and sample and report it to the Animal and Plant Health Agency",D:"Note the fact on your declaration and sell the carcass in the normal way",correct:"D",conf:"Medium"},
  {id:36,code:"D36",cat:"Deer",q:"On inspecting the heart of a deer you have just culled you notice the heart is swollen and discoloured and the pericardium is not loose and lubricated around the heart. What should you do?",A:"Ignore it and sell the carcass locally",B:"Remove the heart note its condition on the declaration before sending to the game dealer",C:"Sell it to the dealer telling him everything was ok",D:"Incinerate the whole carcass and organs and stop culling in that area",correct:"B",conf:"Medium"},
  {id:37,code:"D37",cat:"Deer",q:"On inspecting the organs of a deer you have just culled you notice the liver is swollen and discoloured. What should you do?",A:"Ignore it and sell the carcass locally",B:"Remove the liver note its condition on the declaration before sending to the game dealer",C:"Sell it to the dealer telling him everything was ok",D:"Incinerate the whole carcass and organs and stop culling in that area",correct:"B",conf:"High"},
  {id:38,code:"D38",cat:"Deer",q:"On inspecting the organs of a deer you have just culled you notice the kidneys are swollen and discoloured. What should you do?",A:"Ignore it and sell the carcass locally",B:"Remove the kidneys note its condition on the declaration before sending to the game dealer",C:"Sell it to the dealer telling him everything was ok",D:"Incinerate the whole carcass and organs and stop culling in that area",correct:"B",conf:"High"},
  {id:39,code:"D39",cat:"Deer",q:"If lice are present which is the most likely area in which to notice them on a deer carcass?",A:"Ears",B:"Face",C:"Groin",D:"Rump",correct:"C",conf:"Medium"},
  {id:40,code:"D40",cat:"Deer",q:"If the joint between the hock and canon bones is swollen, what would this suggest to you?",A:"An old deer",B:"A healthy deer",C:"The joint is affected by arthritis",D:"Plague",correct:"C",conf:"High"},
  {id:41,code:"D41",cat:"Deer",q:"You shoot a deer with a badly infected leg wound and it shows signs of infection throughout the carcass. Should you:",A:"Ensure the infected leg is removed before butchering the remainder for sale",B:"Sell the carcass because it is still good to eat",C:"Only give the venison to someone who is going to eat it themselves",D:"Dispose of the carcass in a recognised manner",correct:"D",conf:"High"},
  {id:42,code:"D42",cat:"Deer",q:"You shoot a deer with a deformed foot. Should you:",A:"Reject the carcass as unfit for human consumption",B:"Note the fact on your declaration",C:"Only give the venison to some one who is going to eat it themselves",D:"Ensure the deformed foot is removed before butchering the remainder for sale",correct:"B",conf:"Medium"},
  {id:43,code:"D43",cat:"Deer",q:"You shoot an old deer with a scruffy coat and a number of scabs and lesions all over the animal. In relation to food hygiene what would you do with this carcass?",A:"It has a serious health problems and you should destroy the carcass by incineration",B:"It cannot be sold but can be given away",C:"It should be buried quickly",D:"It can be sold after inspection in the normal way",correct:"A",conf:"Medium"},
  {id:44,code:"D44",cat:"Deer",q:"You shoot a Sika stag in winter with small antlers still in velvet. This suggests:",A:"It has a serious health problems and should be destroyed",B:"It cannot be sold but can be given away",C:"It should be buried quickly",D:"It may be sold after inspection in the normal way.",correct:"D",conf:"Medium"},
  {id:45,code:"D45",cat:"Deer",q:"You shoot a roe doe, with two small antlers. Is this?",A:"Abnormal and should be considered as a health risk",B:"Normal",C:"Abnormal but of no significance as a health risk",D:"Abnormal and must be reported to Animal and Plant Health Agency",correct:"B",conf:"Medium"},
  {id:46,code:"D46",cat:"Deer",q:"A wild deer sees you approach and shows no fear. Is this:",A:"Abnormal behaviours at any time of year",B:"Normal behaviours for deer in the closed season",C:"Normal behaviours at any time of the year",D:"Abnormal behaviours for deer in the closed season",correct:"A",conf:"Medium"},
  {id:47,code:"D47",cat:"Deer",q:"If you find blisters on the tongue and between the cleaves, what might that suggest to you?",A:"The animal had been licking fertilizer bags",B:"The animal had been feeding on thistles",C:"Possible Foot & Mouth disease",D:"The animal was suffering from swine fever",correct:"C",conf:"High"},
  {id:48,code:"D48",cat:"Deer",q:"An injured deer which was thought to have lost a foot in a fox snare has been seen around for several years. When shot the carcass:",A:"Should be destroyed as unsafe to eat",B:"Should be inspected and sold in the normal way if found to be otherwise healthy",C:"Can only be fed to the dogs and not sold into the human food chain",D:"Should be reported to the Animal and Plant Health Agency",correct:"B",conf:"High"},
  {id:49,code:"D49",cat:"Deer",q:"A young deer shot in early spring has diarrhoea. It is in reasonable condition for the time of year and you can find no indication of disease. You should:",A:"Inform the Animal and Plant Health Agency",B:"Reject the carcass and dispose of it",C:"Leave the carcass in the field to avoid contaminating your larder",D:"Send the carcass to the dealer in the normal way noting the condition on the declaration",correct:"D",conf:"Medium"},
  {id:50,code:"D50",cat:"Deer",q:"You shoot a roe buck with corkscrew antlers. You should:",A:"Report the fact immediately to the Animal and Plant Health Agency",B:"Inspect the animal carefully for signs of internal disease",C:"Send the head and pluck to your dealer with the carcass",D:"Reject the carcass as unfit for human consumption",correct:"B",conf:"Medium"},
  {id:51,code:"D51",cat:"Deer",q:"You shoot a roe doe in winter with small antlers in velvet. This suggests:",A:"It has a serious hormone problems and should be destroyed",B:"It counts as a buck and cannot be sold out of season",C:"It can be sold after inspection in the normal way noting the condition on the declaration",D:"It should be buried quickly",correct:"C",conf:"Medium"},
  {id:52,code:"D52",cat:"Deer",q:"If the retropharyngeal and mesenteric nodes are enlarged what might this suggest to you?",A:"An old deer",B:"Foot & Mouth Disease",C:"A healthy deer",D:"Suspect TB",correct:"D",conf:"High"},
  {id:53,code:"D53",cat:"Deer",q:"Bovine Tuberculosis is a notifiable disease – the most common symptoms are:",A:"Loss of hair",B:"Enlarged and/or Infected lymph glands at the back of the throat, in the gralloch and/or in the pluck",C:"Swollen and blistered feet and tongue",D:"Blindness",correct:"B",conf:"High"},
  {id:54,code:"D54",cat:"Deer",q:"If any or both kidneys are grossly enlarged with fluid, what might that suggest to you?",A:"Hydronephrosis (a urinary blockage)",B:"Suspect TB",C:"Suspect Anthrax",D:"A normal kidney during periods of heavy rain",correct:"A",conf:"High"},
  {id:55,code:"D55",cat:"Deer",q:"If you suspected anthrax in a deer you had shot what should you do?",A:"Ignore it and sell the carcass locally",B:"Isolate carcass and inform Animal and Plant Health Agency without delay",C:"Sell it to the dealer telling him everything was ok",D:"Incinerate the whole carcass and organs and stop culling in that area",correct:"B",conf:"High"},
  {id:56,code:"D56",cat:"Deer",q:"When gralloching a deer you discover she is pregnant and the foetus has been dead for a long time. You should:",A:"Sell the carcass to a dealer in the normal way after inspection",B:"Only use the carcass for your own consumption",C:"Dispose of the carcass properly - it should not enter the food chain.",D:"Report the matter immediately to the Animal and Plant Health Agency Service",correct:"C",conf:"High"},
  {id:57,code:"D57",cat:"Deer",q:"In late autumn/early winter, which internal organ is most likely to be encased in fat?",A:"Spleen",B:"Liver",C:"Kidneys",D:"Ovaries/testes",correct:"C",conf:"Medium"},
  {id:58,code:"D58",cat:"Deer",q:"If you observe a swollen retropharyngeal lymph node what should you do?",A:"Cut it out and throw it away",B:"Ignore it as carcass looks ok",C:"Ignore it as the game dealer is only going to make sausages from the head and neck meat",D:"Isolate the carcass from other carcasses and report to the Animal and Plant Health Agency",correct:"D",conf:"High"},
  {id:59,code:"D59",cat:"Deer",q:"If the retropharyngeal and mesenteric nodes are enlarged, what might that suggest?",A:"The animal has Bovine Tuberculosis",B:"The animal had liver fluke",C:"The animal had been feeding on thistles",D:"The animal was suffering from lung worm",correct:"A",conf:"High"},
  {id:60,code:"D60",cat:"Deer",q:"You find a dead deer which looks in very poor condition and is bleeding from all body openings a dark foul smelling blood. What would you suspect and do in these circumstances.",A:"Its common condition in UK deer ignore it and bury the carcass.",B:"Suspect Anthrax and call Animal and Plant Health Agency straight away",C:"Suspect a disease but leave the carcass there and tell no one",D:"Is not dangerous to man and can be safely ignored and eaten",correct:"B",conf:"High"},
  {id:61,code:"D61",cat:"Deer",q:"You shoot a limping deer in October. During carcass inspection you find a badly bruised shoulder the result of a rutting injury. You should:",A:"Report the condition by telephone to the Animal and Plant Health Agency without delay",B:"Put the whole carcass into your car and take it to the local Animal and Plant Health Agency the next day",C:"Dispose of it by burying the carcass at least 1 meter below ground as you do not need to inform anybody even though you cannot use it",D:"Record the condition on the declaration and send it to the dealer in the normal way.",correct:"D",conf:"High"},
  {id:62,code:"D62",cat:"Deer",q:"You shoot a deer with a swollen knee joint on inspection you identify it is infected with septic arthritis. What should you do with that carcass?",A:"Labeled as correctly inspected, then delivered to the dealer",B:"Delivered to the dealer un-eviscerated and with head on",C:"Delivered to the dealer with its pluck and head with a note of the circumstances",D:"Destroyed as unfit for human consumption",correct:"D",conf:"Medium"},
  {id:63,code:"D63",cat:"Deer",q:"You shoot a deer with a clear nasal discharge and rub patches on the side of the head, on inspection you identify it is infested with nasal bot fly larvae. What should you do with that carcass?",A:"Labeled as correctly inspected, then delivered to the dealer",B:"Delivered to the dealer un-eviscerated and with head on",C:"Delivered to the dealer with its pluck and head with a note of the circumstances",D:"Destroyed as unfit for human consumption",correct:"A",conf:"Medium"},
  {id:64,code:"D64",cat:"Deer",q:"You observe a roe doe in Aug still retaining its previous year's winter coat. What would you suspect",A:"Suspect infected with Bovine Tuberculosis",B:"Seriously infested with internal parasites",C:"Seriously infested with external parasites",D:"Had been living on poor grazing",correct:"B",conf:"Medium"},
  {id:65,code:"D65",cat:"Deer",q:"After gralloching deer in the field, which method reduces the risk of the environment contaminating the carcass?",A:"Keeping knife cuts large",B:"Avoiding dragging through dirty areas",C:"Float it down the stream",D:"Drag through wet areas to make it easy",correct:"B",conf:"High"},
  {id:66,code:"D66",cat:"Deer",q:"When gralloching deer in the field, using small cuts helps to minimise?",A:"Chemical contamination",B:"Physical damage",C:"Environmental contamination",D:"Financial loses",correct:"C",conf:"Medium"},
  {id:67,code:"D67",cat:"Deer",q:"A deer shot incorrectly in the stomach can lead to:",A:"Chemical contamination",B:"Lower financial return for the carcass",C:"Carcass contamination from gun oil in the barrel",D:"Carcass contamination from gut contents",correct:"D",conf:"High"},
  {id:68,code:"D68",cat:"Deer",q:"The hunter has shot a deer that was facing him and the bullet has exited near its anus.The carcass is:",A:"Perfectly safe for human consumption",B:"OK to sell when it has been hosed out and trimmed",C:"Required as evidence for the subsequent court case",D:"Likely to be grossly contaminated and unfit for the human food chain",correct:"D",conf:"High"},
  {id:69,code:"D69",cat:"Deer",q:"If venison is contaminated with gut contents, the risk to humans eating the meat is that they could:",A:"Be offended by the tainted meat",B:"Be infected with a disease like Tuberculosis",C:"Become sick from bacterial food poisoning like e-coli.",D:"Be infected with worms such as tape worm",correct:"C",conf:"High"},
  {id:70,code:"D70",cat:"Deer",q:"You have to leave the carcass in the woods for 30 minutes in summer while you go to back to fetch a vehicle, you should:",A:"Hang it up in the shade wrapped in muslin or a fly net",B:"Bury the carcass with leaves to keep the flies off",C:"Put it in a plastic sack in the shade to keep the flies off",D:"Leave the carcass hanging in the sun to dry off the meat",correct:"A",conf:"High"},
  {id:71,code:"D71",cat:"Deer",q:"You are a short distance from your larder when you shoot a deer - it is best practice to:",A:"Gralloch in the field because the carcass will go green if you delay",B:"Drag it back to keep your vehicle clean",C:"Load it into a vehicle and gralloch in the larder",D:"Gralloch in the field because there is less problem disposing of the offal",correct:"A",conf:"Medium"},
  {id:72,code:"D72",cat:"Deer",q:"Why is the inspection of the carcass important?",A:"To get the best price for the carcass",B:"To ensure that the carcass is fit to enter the human food chain",C:"So the carcass can be exported",D:"To ensure you keep the best cuts of venison",correct:"B",conf:"High"},
  {id:73,code:"D73",cat:"Deer",q:"What is the maximum temperature that large game should be stored at?",A:"3 °C",B:"5 °C",C:"7 °C",D:"9 °C",correct:"C",conf:"High"},
  {id:74,code:"D74",cat:"Deer",q:"What is the correct chilling temperature of a deer carcass?",A:"Progressively chilled to between 1 & 7°C",B:"Progressively chilled to between 1 & 8°C",C:"Progressively chilled to between 1 & 9°C",D:"Progressively chilled to between 1 & 10°C",correct:"A",conf:"High"},
  {id:75,code:"D75",cat:"Deer",q:"A deer is killed during a drive on a pheasant shoot with a shotgun using No 6 shot. Can you legally sell the carcass?",A:"No it had been taken by an illegal hunting method in the UK",B:"Yes as long as you inspect the carcass",C:"Yes as long as the shoot owner agrees it's your carcass",D:"As long as you tell DEFRA first",correct:"A",conf:"High"},
  {id:76,code:"W76",cat:"Wild boar",q:"Which of the following diseases/conditions are particularly relevant to Wild Boar?",A:"Avian Tb and Scrapie",B:"Trichinella and Swine Fever",C:"Warble fly and Sunburn",D:"Phytophthora and Nasal Bot fly",correct:"B",conf:"High"},
  {id:77,code:"W77",cat:"Wild boar",q:"What are the hunter's responsibilities regarding Trichinella testing?",A:"Trichinella testing is compulsory in all shot Wild Boar entering the food chain",B:"Trichinella testing is voluntary, kits are available from the FSA",C:"Trichinella testing by the hunter is only required if the carcass will be delivered to an AGHE",D:"Trichinella is not a disease relevant to Wild Boar",correct:"C",conf:"High"},
  {id:78,code:"W78",cat:"Wild boar",q:"How should notifiable diseases in Wild Boar be reported?",A:"There is no requirement to report Notifiable diseases in Wild Boar",B:"Only suspected Swine Fever needs to be reported",C:"There is no need to report suspected Notifiable disease provided the carcass is buried immediately",D:"All notifiable disease should be reported to the Defra Rural Services Helpline or nearest APHA Field Services office in Scotland",correct:"A",conf:"High"},
  {id:79,code:"W79",cat:"Wild boar",q:"Which food hygiene legislation is relevant to Wild Boar?",A:"All UK food hygiene regulations apply, together with the FSA Wild Game Guide",B:"Only farmed wild boar are covered by food regulations",C:"Only the Wild Game Guide applies",D:"Food hygiene regs do not apply to Wild Boar",correct:"A",conf:"High"},
  {id:80,code:"W80",cat:"Wild boar",q:"For wild Boar carcasses being delivered by the hunter to an AGHE?",A:"The carcass can be delivered head and feet off",B:"the carcass can be delivered skinned",C:"The carcass can be delivered frozen",D:"The carcass must be delivered head & feet on with the diaphragm (or major part of it) intact",correct:"D",conf:"Medium"},
  {id:81,code:"W81",cat:"Wild boar",q:"There are many notifiable diseases. Which list below is most relevant to Wild Boar?",A:"Rift Valley Fever, Rinderpest, Scrapie, Sheep Pox, Equine Infectious Anaemia",B:"African Swine Fever, Aujeszky's Disease, Classical Swine Fever, Swine Vesicular Disease, Foot and Mouth Disease",C:"Enzootic Bovine Leukosis, Epizootic Haemorrhagic Virus Disease, Epizootic Lymphangitis, Equine Viral Arteritis",D:"Glanders and Farcy, Goat Pox, Lumpy Skin Disease, Newcastle Disease",correct:"B",conf:"High"},
  {id:82,code:"W82",cat:"Wild boar",q:"When gralloching a boar, you find a small, greenish liquid filled sack on the liver. What do you do?",A:"Suspect a disease so condemn the carcass",B:"Suspect disease so burn all internal organs",C:"Nothing, this is the gall bladder and is normal",D:"Call APHA to let them know what you have found",correct:"C",conf:"Medium"},
  {id:83,code:"W83",cat:"Wild boar",q:"Which of the following best describes a boars hoofprint",A:"Small with pointed ends",B:"Large with pointed ends",C:"Large with 3 visible \"toeprints\"",D:"Large, rounded and often with 2 smaller prints at the rear from dew claws.",correct:"D",conf:"Medium"},
  {id:84,code:"W84",cat:"Wild boar",q:"How do we test for Trichinella in a boar carcass?",A:"Cook and eat a small piece of meat to see if we get sick",B:"Take a sample of the boars haunch to be sent for testing",C:"Take a sample of the boars diaphragm, tongue or foreleg and send for testing",D:"We don't need to, there's no chance boar in the UK can carry trichinella",correct:"C",conf:"High"},
  {id:85,code:"W85",cat:"Wild boar",q:"Which of the following describes the Trichinosis disease?",A:"Caused by a parasitic worm living in the muscles",B:"Caused by a virus",C:"Caused by bacteria in the boars mouth",D:"Caused by poor carcass handling",correct:"A",conf:"High"},
  {id:86,code:"W86",cat:"Wild boar",q:"If you are unable to take a Trichinella sample from the diaphragm, where else is acceptable to sample?",A:"The foreleg and back of the tongue",B:"The ear tissue",C:"The intestines",D:"The snout",correct:"A",conf:"Medium"},
  {id:87,code:"H1",cat:"Hygiene",q:"You have been instructed to immediately cull a deer on a field which has recently been spread with slurry. What would you do to comply with food hygiene regulations?",A:"Shoot and gralloch the animal in the field and sell to the game dealer as normal",B:"Shoot the deer but reject the carcass because of potential contamination",C:"Cull the deer and wash the carcass down to make it fit to go in the food chain",D:"Wait until the deer has moved off the field, then cull it and treat it as normal",correct:"B"},
  {id:88,code:"H2",cat:"Hygiene",q:"Ideally, in the field you should try to hang a deer when gralloching because?",A:"It stops you getting back ache",B:"Reduces the risk of environmental contamination",C:"Reduces risk of fly strike",D:"Encourages external parasites to drop off naturally",correct:"B"},
  {id:89,code:"H3",cat:"Hygiene",q:"Shot game that enters a water course is:",A:"Less likely to be damaged",B:"Safe as any contamination will wash off",C:"Likely to have bacteria transmitted to the carcass",D:"Safe as they are classed as potable water",correct:"C"},
  {id:90,code:"H4",cat:"Hygiene",q:"Water required to keep a game larder and utensils clean can come from:",A:"Collected rainwater",B:"A water course or lake",C:"Any spring or stream",D:"A potable water supply",correct:"D"},
  {id:91,code:"H5",cat:"Hygiene",q:"Soil and plant debris from the countryside:",A:"Can contaminate game meat with bacteria",B:"Is what makes game organic and is not dangerous",C:"Cannot transfer disease to meat or other animals",D:"Can make game gritty to eat but is not dangerous",correct:"A"},
  {id:92,code:"H6",cat:"Hygiene",q:"You are asked to collect game carcasses with your vehicle which has been carrying a chemical sprayer, a chainsaw and petrol you should:",A:"Thoroughly wash your vehicle out then collect the game",B:"Put the game on some fresh leaves or straw",C:"Just put it in the back of the vehicle regardless",D:"Put the game in plastic bags in the back of the vehicle",correct:"A"},
  {id:93,code:"H7",cat:"Hygiene",q:"Before loading carcasses into the back of a pick-up you should:",A:"Put a good layer of straw down",B:"Clean out the back and sterilise",C:"Use clean hessian or plastic seed sacks to absorb the blood",D:"Push the spare petrol can aside so you can load dogs and the game",correct:"B"},
  {id:94,code:"H8",cat:"Hygiene",q:"You shoot 3 Fallow deer and 2 Muntjac on a morning stalk. Can you transport all of the deer together in your vehicle?",A:"Yes as long as you apply hygienic practices for transporting carcasses",B:"No species must be separated for transporting",C:"No not in the same vehicle as there is a risk of cross contamination",D:"As long as your game dealer agrees",correct:"A"},
  {id:95,code:"H9",cat:"Hygiene",q:"You shoot several ducks of different species on a morning flight. Can you transport all of the carcasses together in your vehicle?",A:"Yes as long as you apply hygienic practices for transporting carcasses",B:"No species must be separated for transporting",C:"No not in the same vehicle as there is a risk of cross contamination",D:"As long as your game dealer agrees",correct:"A"},
  {id:96,code:"H10",cat:"Hygiene",q:"The rule of storing fuel in a game larder is:",A:"It is fine to do so if there is no game in the larder at the same time",B:"The fuel is kept away from any game hanging up",C:"You scrub out the game larder properly afterwards before using it for game",D:"You should never store fuel in the game larder",correct:"D"},
  {id:97,code:"H11",cat:"Hygiene",q:"A carcass stored in a garden shed for two days will be?",A:"A risk to human health",B:"Better tasting than one in a chiller",C:"Worth less when offered for sale",D:"Only fit for sausage meat",correct:"A"},
  {id:98,code:"H12",cat:"Hygiene",q:"What is a zoonosis?",A:"A disease transmittable from wild animals to cattle",B:"A disease transmittable from plants to animals",C:"A disease transmittable from mammals to birds",D:"A disease transmittable from animals to humans",correct:"D"},
  {id:99,code:"H13",cat:"Hygiene",q:"Identify the zoonotic diseases from the groups listed below:",A:"Yellow fever, Diphtheria, Polio, Cholera and Plague.",B:"Foot rot, arthritis, dermatitis, sway back and laminitis:",C:"Ticks, Keds, Lice, Warble fly and Nasal Bot fly",D:"TB, Rabies, Brucellosis and Avian influenza",correct:"D"},
  {id:100,code:"H14",cat:"Hygiene",q:"Which of the following notifiable diseases can be transmitted to humans from animals?",A:"Liver fluke, lung worm, nasal bot, warble",B:"TB , Brucellosis, Rabies and psittacosis",C:"Measles",D:"Yellow fever",correct:"B"},
  {id:101,code:"H15",cat:"Hygiene",q:"If bacteria from the environment get into game meat it could?",A:"Be detected and the meat thrown away",B:"Cause no harm to health",C:"Cause serious food poisoning",D:"Only harm the young and vulnerable",correct:"C"},
  {id:102,code:"H16",cat:"Hygiene",q:"What is the most suitable material for lining a game larder?",A:"Oak panelling",B:"Lime washed brick walls",C:"Smooth, light in colour, impervious materials",D:"Unpainted thermal blocks",correct:"C"},
  {id:103,code:"H17",cat:"Hygiene",q:"When preparing game you damage a work surface. You should:",A:"Repair it as soon as possible",B:"Wait until you get time before repairing the damage",C:"Wait until an EHO spots the damage",D:"Cover it up and hope that it won’t get spotted",correct:"A"},
  {id:104,code:"H18",cat:"Hygiene",q:"Which of the following do not meet the hygiene standards for game larders?",A:"Cleanable hanging facilities",B:"A segregated hanging area, stainless steel fixtures and fittings",C:"Wooden handled knives and blocks",D:"A well ventilated brick building with good lighting",correct:"C"},
  {id:105,code:"H19",cat:"Hygiene",q:"How often should you check your larder temperature?",A:"Daily",B:"Weekly",C:"Only during cold weather",D:"Only during hot weather",correct:"A"},
  {id:106,code:"H20",cat:"Hygiene",q:"Why should larders have impervious ceilings, floors and walls?",A:"So you can write clearly on the wall",B:"To stop flies settling",C:"To keep the larder cool",D:"So the larder can be easily cleaned and sanitized",correct:"D"},
  {id:107,code:"H21",cat:"Hygiene",q:"What material should be used for larder knife handles:",A:"Wood",B:"Plastic",C:"Bone",D:"Rubber",correct:"B"},
  {id:108,code:"H22",cat:"Hygiene",q:"Which is the best method of cleaning a larder knife?",A:"Wash, rinse, and dry",B:"Disinfect and dry with a towel",C:"Rinse and dry with a cloth",D:"Wash, sanitise, and leave to dry",correct:"D"},
  {id:109,code:"H23",cat:"Hygiene",q:"Larder tools and equipment are cleaned:",A:"After each use and before starting a new carcass",B:"Regularly once every two weeks",C:"At the beginning and end of the shooting season",D:"Only when heavily soiled",correct:"A"},
  {id:110,code:"H24",cat:"Hygiene",q:"Cleaning equipment between uses:",A:"Is not necessary if tools have plastic handles",B:"Is not necessary if tools are made of stainless steel",C:"Reduces the risk of cross contamination",D:"Is not necessary if the larder is secure from pests and predators",correct:"C"},
  {id:111,code:"H25",cat:"Hygiene",q:"Whilst preparing a carcass in the larder, you drop your knife on the floor. You should:",A:"Pick it up and carry on regardless",B:"Wipe the blade on the carcass",C:"Wipe the blade clean on a disposable paper towel",D:"Wash and sanitise it before continuing, or replace it",correct:"D"},
  {id:112,code:"H26",cat:"Hygiene",q:"A game larder can be used to store:",A:"Carcasses and firearms and other shoot equipment",B:"Carcasses and preparation equipment only",C:"Chemicals as long as game is not present",D:"Equipment and firearms but not controlled chemicals",correct:"B"},
  {id:113,code:"H27",cat:"Hygiene",q:"Smoking when working with carcasses:",A:"Good because it hides the smell",B:"Allowed, as long as the butts are disposed safely",C:"Not allowed as it creates a risk to food safety",D:"Good because it keeps the flies away from the carcasses",correct:"C"},
  {id:114,code:"H28",cat:"Hygiene",q:"You arrive at the larder with several carcasses. You should:",A:"Unload everything onto the ground outside the larder",B:"Unload everything onto the larder floor to sort it out",C:"Unload straight from the vehicle onto gambrels in the larder",D:"Put the game in the cold store in sacks to hang up later",correct:"C"},
  {id:115,code:"H29",cat:"Hygiene",q:"Which of the following statements is true?",A:"Fur and feathered game must be hung separately only if they were shot in different woods",B:"Fur and feathered game can be hung together in the larder",C:"You require two separate larders for fur and feather",D:"Fur and feathered game must be hung separately",correct:"D"},
  {id:116,code:"H30",cat:"Hygiene",q:"Which one of the following is a common food pest?",A:"Spider",B:"Blowfly",C:"Woodlice",D:"Bee",correct:"B"},
  {id:117,code:"H31",cat:"Hygiene",q:"The most effective way for laying pest bait (poison) is:",A:"On saucers in the larder, so it is easy to see how much bait has been taken",B:"Outside the larder in approved bait boxes",C:"Inside the larder in a wire cage",D:"In plastic sachets inside the larder, so it is easy to see when the bags are missing",correct:"B"},
  {id:118,code:"H32",cat:"Hygiene",q:"Your larder door lets flies in through a gap by the hinges. You can best solve this problem by:",A:"Spraying the carcasses inside and out with fly spray",B:"Hanging up sticky fly papers near the carcasses",C:"Use a sealant in the gap to make the door fly-proof",D:"Giving a few squirts of fly spray into the air each time you close the door.",correct:"C"},
  {id:119,code:"H33",cat:"Hygiene",q:"Contamination caused by pests in a larder can be dealt with by:",A:"Leaving food outside the larder for the pests to eat",B:"Using cats to control the pests",C:"Good temperature control",D:"Preventing access to pests",correct:"D"},
  {id:120,code:"H34",cat:"Hygiene",q:"Indicate the main reason why pests are not allowed in a game larder:",A:"Pests make customers nervous",B:"Pests make staff nervous",C:"Pests can transfer food poisoning bacteria to food",D:"It is expensive to employ private contractors to get rid of pests",correct:"C"},
  {id:121,code:"H35",cat:"Hygiene",q:"When should the larder be cleaned?",A:"Regularly once a month",B:"After each use and between batches of game",C:"At the beginning and end of the season",D:"Only when heavily soiled",correct:"B"},
  {id:122,code:"H36",cat:"Hygiene",q:"Which of the following actions will help ensure that disinfectants are used effectively?",A:"Keep them topped up regularly",B:"Always store in a dark room",C:"Make them up as strong as possible",D:"Used in accordance with the label",correct:"D"},
  {id:123,code:"H37",cat:"Hygiene",q:"What should you use when cleaning the larder floor and walls?",A:"A strong-smelling disinfectant like Jeyes fluid",B:"A pine-scented toilet disinfectant like Harpic",C:"An approved food safe cleaner",D:"Dilute ammonia or Savlon.",correct:"C"},
  {id:124,code:"H38",cat:"Hygiene",q:"Disinfectants will do which of the following?",A:"Remove bacteria completely",B:"Remove stains from impervious surfaces",C:"Reduce the number of bacteria to a safe level",D:"Remove grease from working surfaces",correct:"C"},
  {id:125,code:"H39",cat:"Hygiene",q:"If inappropriate cleaning agents are used in the larder, it may lead to:",A:"Game meat only being fit for your own consumption",B:"A public health risk if it enters the human food chain",C:"A lower financial return for the carcasses",D:"Sweet smelling carcasses",correct:"B"},
  {id:126,code:"H40",cat:"Hygiene",q:"Your larder drain is smelly. You should:",A:"Flush it out well with clean water and an approved cleaning agent",B:"Pour a whole bottle of lavatory cleaner down it",C:"Use any brand of cleaner as long as it has a strong pine smell",D:"Use an air freshener until the weather gets colder",correct:"A"},
  {id:127,code:"H41",cat:"Hygiene",q:"Which one of the following is the correct method of storing cleaning materials?",A:"In the game larder",B:"In the Gun room",C:"In a clearly marked cupboard",D:"On a window sill in the tool store",correct:"C"},
  {id:128,code:"H42",cat:"Hygiene",q:"How can you make sure that cleaning agents are used properly?",A:"By always following the label",B:"Store them in the toilet",C:"Use double the concentration",D:"Add them to a detergent",correct:"A"},
  {id:129,code:"H43",cat:"Hygiene",q:"Which one of the following statements is true?",A:"A detergent kills bacteria",B:"A sterilizer removes dirt",C:"Disinfectants cannot be used to sterilise a surface",D:"A sanitizer kills bacteria",correct:"D"},
  {id:130,code:"H44",cat:"Hygiene",q:"Cleaning chemicals which are not rinsed from food handling areas:",A:"Can contaminate the food and may be a risk to human health",B:"Will help to keep the area clean over a longer period of time",C:"Demonstrate you have cleaned the larder",D:"Will breakdown when in contact with meat",correct:"A"},
  {id:131,code:"H45",cat:"Hygiene",q:"Which one of the following statements best describes the action of a detergent?",A:"It kills all bacteria and cleans floors",B:"It removes grease and food debris but does not kill bacteria",C:"It sterilises worktops and leaves no smell",D:"It reduces the number of bacteria on worktops",correct:"B"},
  {id:132,code:"H46",cat:"Hygiene",q:"The main reason for the use of disinfectants in the game meat industry is to:",A:"Mask the smell of rotten game",B:"Kill all bacteria on work surfaces and equipment",C:"Reduce bacteria to a safe level on work surfaces and equipment",D:"Remove dirt, grease and food particles",correct:"C"},
  {id:133,code:"H47",cat:"Hygiene",q:"Disinfectants are used in food preparation areas to:",A:"Remove stains from surfaces",B:"Reduce bacteria to a safe level",C:"Reduce smells from drains",D:"Reduce the need for scrubbing",correct:"B"},
  {id:134,code:"H48",cat:"Hygiene",q:"After each use, larders should be cleaned to:",A:"Keep them clean in case the EHO visits",B:"To keep the game dealer happy",C:"To ensure they do not get rusty and last a lifetime",D:"To prevent bacteria being transferred to the next batch of game",correct:"D"},
  {id:135,code:"H49",cat:"Hygiene",q:"It is important to store larder waste in a sealed container, why?",A:"To keep the waste fresh",B:"To reduce the risk of cross contamination",C:"To help keep overalls clean",D:"To keep the temperature of the waste down",correct:"B"},
  {id:136,code:"H50",cat:"Hygiene",q:"What is the minimum depth below ground that you should bury larder waste if permitted to do so on that site?",A:"1inch",B:"1cm",C:"1m",D:"1 foot",correct:"C"},
  {id:137,code:"H51",cat:"Hygiene",q:"What should you do if you cut your finger whilst handling game?",A:"Carry on working",B:"Bandage the cut",C:"Stop work and go home",D:"Cover the cut with a waterproof blue coloured detectable dressing",correct:"D"},
  {id:138,code:"H52",cat:"Hygiene",q:"Why should you wash your hands frequently whilst handling game?",A:"Stops you smelling of game",B:"To protect yourself from infection",C:"To reduce the risk of cross contamination",D:"To prevent your hands getting sore",correct:"C"},
  {id:139,code:"H53",cat:"Hygiene",q:"Eating food of any type in the game larder is?",A:"Allowed if you wash your hands",B:"Poor hygiene practice and should not be allowed",C:"Allowed if you do not put food wrappers in the rubbish bin",D:"Allowed if you do not use the knives or other tools",correct:"B"},
  {id:140,code:"H54",cat:"Hygiene",q:"Your assistant has diarrhoea and you are short-handed. You should tell them to:",A:"Stay close to a toilet and do all the larder work",B:"Go out to the woods but take plenty of toilet paper with him",C:"Not to handle game or do any larder work",D:"Stop complaining, take a pill and wear plastic gloves when handling game",correct:"C"},
  {id:141,code:"H55",cat:"Hygiene",q:"You have a small open wound. You should:",A:"Wash the cut and apply antiseptic before dealing with game carcasses",B:"Put on a blue dressing and a plastic glove before handling any game",C:"Put on a bandage dressing to absorb the blood",D:"Ignore the wound, there is plenty of blood about anyway",correct:"B"},
  {id:142,code:"H56",cat:"Hygiene",q:"It is muddy and wet. When you get to the larder, what is the minimum precaution you should take?",A:"Get finished quickly even if your clothes and boots are very muddy",B:"Not touch any carcass until you have changed into white clothes and a hairnet",C:"Wash your boots outside and put on a clean apron",D:"Keep a set of old overalls in the larder to protect your clothes from blood",correct:"C"},
  {id:143,code:"H57",cat:"Hygiene",q:"When preparing carcasses in the larder, you should wash your hands and knife:",A:"On each occasion before you touch or cut exposed flesh",B:"Before you start and when you finish working on each carcass",C:"Only if they are very dirty",D:"Only if the deer had to be dragged during extraction and is muddy",correct:"B"},
  {id:144,code:"H58",cat:"Hygiene",q:"You are suffering from food poisoning on the day of a shoot. Which ONE of the following should you do?",A:"Not work with game meat",B:"Work as normal.",C:"Take the day off",D:"Keep quiet about it",correct:"A"},
  {id:145,code:"H59",cat:"Hygiene",q:"If a gamekeeper has a boil on their arm what should they do?",A:"Stay at home",B:"Tell the Environmental Health Department",C:"Work as normal",D:"Stay at work but wear a blue plaster over the boil and don’t handle the meat",correct:"D"},
  {id:146,code:"H60",cat:"Hygiene",q:"Why would you have to avoid handling game meat if a member of your household has food poisoning symptoms?",A:"Handling meat could trigger symptoms in you",B:"Bacteria from the meat could make the sick person’s symptoms worse",C:"You might need to leave work quickly",D:"You may be carrying food poisoning germs without showing symptoms",correct:"D"},
  {id:147,code:"H61",cat:"Hygiene",q:"Which one of the following is a common symptom of food poisoning?",A:"Vomiting",B:"Rashes",C:"Sore throat",D:"Blurred vision",correct:"A"},
  {id:148,code:"H62",cat:"Hygiene",q:"Which one of the following is a common symptom of food poisoning?",A:"Diarrhoea",B:"Aching muscles",C:"Tiredness",D:"Sneezing",correct:"A"},
  {id:149,code:"H63",cat:"Hygiene",q:"Which one of the following statements about food law is correct?",A:"Only the owner of a food business can be prosecuted",B:"You do not have to tell your supervisor if you have diarrhoea",C:"You break the law if you do not maintain minimum standards of cleanliness at work",D:"You cannot break Food Law if you are self employed",correct:"C"},
  {id:150,code:"H64",cat:"Hygiene",q:"Which one of the following statements about food law is correct?",A:"Only needs to be registered as a food business if selling outside of the game season",B:"Any supply of processed game meat requires registration as a food business",C:"Only game dealers, shops and pubs selling food are considered food businesses",D:"You prepare game for your own consumption you must be registered as food business",correct:"B"},
  {id:151,code:"H65",cat:"Hygiene",q:"If you are delivering carcasses to an Approved Game Handling Establishment, what minimum principles should you meet for personal hygiene?",A:"You should observe the current regulations and codes of practice for personal hygiene while handling wild game",B:"You can only handle game you shot and transported",C:"Make sure you have wiped any blood off your hands before handling the carcass",D:"You do not need to abide by any regulations for export carcasses",correct:"A"},
  {id:152,code:"H66",cat:"Hygiene",q:"You have to change a wheel on your ATV before handling carcasses:",A:"There is no need to wash your hands",B:"Wash your hands in the nearest puddle",C:"There is no hygiene problem as long as the equipment used is clean",D:"You should wear clean plastic gloves whenever handling carcasses",correct:"D"},
  {id:153,code:"H67",cat:"Hygiene",q:"Protective clothing is worn in the larder to:",A:"Protect personal clothing from becoming spoiled with blood",B:"Make the larder workforce look professional",C:"Impress the Environmental Health Officer",D:"Prevent personal clothing being a source of contamination",correct:"D"},
  {id:154,code:"H68",cat:"Hygiene",q:"Hygiene regulations help ensure game larders maintain:",A:"Personal safety",B:"Food safety",C:"The Working Time Directive",D:"Health & Safety at Work",correct:"B"},
  {id:155,code:"H69",cat:"Hygiene",q:"The light in a game larder must be:",A:"Not less than 2000 lux",B:"Not less than 3 x 5 foot neon tubes",C:"Sufficient to inspect carcasses",D:"A single 150 watt bulb",correct:"C"},
  {id:156,code:"H70",cat:"Hygiene",q:"Which one of the following statements is correct?",A:"Food Laws protects the consumer from poor food hygiene practices",B:"Only large food companies have to have hazard analysis",C:"Food Laws do not apply to a stand selling hot dogs at a funfair",D:"Food laws only applies to medium-high risk food",correct:"A"},
  {id:157,code:"H71",cat:"Hygiene",q:"Which one of the following statements about bacteria is correct?",A:"Insects do not spread bacteria",B:"All bacteria can be washed off food",C:"Bacteria grow best below 5ºC",D:"Dirty cloths can spread bacteria",correct:"D"},
  {id:158,code:"H72",cat:"Hygiene",q:"At which one of the following temperatures do food poisoning bacteria grow best?",A:"7º C",B:"53º C",C:"37º C",D:"75º C",correct:"C"},
  {id:159,code:"H73",cat:"Hygiene",q:"Which one of the following statements is true?",A:"All food businesses must be registered",B:"Lavatories must lead directly into food rooms",C:"Smoking is not allowed within 50 meters of a food production area",D:"All food handlers with less than 12 months experience need a medical before they start work",correct:"A"},
  {id:160,code:"H74",cat:"Hygiene",q:"Which one of the following is a legal requirement for a food business?",A:"They must only employ staff aged 18 or over",B:"Premises must be maintained in good condition and kept clean",C:"There must be a canteen serving hot drinks for breaks",D:"There must be a ‘NO SMOKING’ notice in the toilets",correct:"B"},
  {id:161,code:"H75",cat:"Hygiene",q:"A well designed game larder has:",A:"Sufficient room and light to handle/inspect game easily and store it",B:"Poor insulation which will not prevent game from heating up",C:"No door to allow easy access with trays and carcasses",D:"A wooden floor and walls so blood can drain away easily",correct:"A"},
  {id:162,code:"H76",cat:"Hygiene",q:"Hygiene regulations lay down measures to ensure that game transport:",A:"Maintains the safety of food",B:"Maintains driver safety",C:"Has a limited environmental impact",D:"Stipulates minimum quantities of food transported",correct:"A"},
  {id:163,code:"H77",cat:"Hygiene",q:"When recovering game from the field to the larder, the best method of transport is:",A:"The quickest and cheapest to run",B:"The largest and best cross-country performance",C:"The one which gets the game home in best condition.",D:"The one which has the most traditional image",correct:"C"},
  {id:164,code:"H78",cat:"Hygiene",q:"It is a legal requirement for larder equipment & tools to be?",A:"Cleanable",B:"Easy to use",C:"Recorded",D:"Disposable",correct:"A"},
  {id:165,code:"H79",cat:"Hygiene",q:"Which of the following features of larder tools and equipment is controlled by food hygiene legislation?",A:"Safety",B:"Ease of cleaning",C:"Appearance",D:"Colour",correct:"B"},
  {id:166,code:"H80",cat:"Hygiene",q:"All work surfaces used in a game larder must be made of:",A:"Sanded and varnished planks of timber",B:"Non-absorbent materials",C:"Solid beech blocks and sawn wood",D:"Asbestos sheeting.",correct:"B"},
  {id:167,code:"H81",cat:"Hygiene",q:"HACCP Plan (Hazard Analysis Critical Control Point) should start :",A:"When preparing to hunt game",B:"When disposing of game",C:"When the game arrives at the larder",D:"When game arrives at the game dealer",correct:"A"},
  {id:168,code:"H82",cat:"Hygiene",q:"Which one of the following statements about HACCP is true?",A:"It is primarily concerned with the management of food safety",B:"It is intended to reduce weekly working hours",C:"The purpose is to reduce accidents by game delivery vehicles",D:"It increases the value of wild game meat",correct:"A"},
  {id:169,code:"H83",cat:"Hygiene",q:"Which one of the following statements best describes ‘Hazard Analysis Critical Control Point system’ (HACCP)?",A:"HACCP seeks to identify food hygiene hazards and control them",B:"HACCP is mainly concerned with fire prevention and escape on the premises",C:"The entire HACCP system only needs to be reviewed once every 4 years",D:"HACCP is not suitable for use in game collecting centres",correct:"A"},
  {id:170,code:"H84",cat:"Hygiene",q:"Who must follow the HACCP principles?",A:"Game dealers only",B:"Only stalkers and game shooters",C:"The local authority Environmental Health Officer",D:"Everyone involved in handling game carcasses",correct:"D"},
  {id:171,code:"H85",cat:"Hygiene",q:"Who must maintain records when placing a carcass into the human food chain?",A:"The Veterinary officer at an approved game dealer only",B:"Food Business Operators only",C:"Everyone who supplies game at each level",D:"The local authority Environmental Health Officer",correct:"C"},
  {id:172,code:"H86",cat:"Hygiene",q:"All game being supplied to an Approved Game Handling Establishment must first be inspected by:",A:"The land owner or representing agent",B:"Any Gamekeeper/ stalker",C:"A trained person",D:"The driver of the delivery vehicle",correct:"C"},
  {id:173,code:"H87",cat:"Hygiene",q:"Good record keeping is important for food safety because it enables:",A:"The accountants and tax man to detect fraud",B:"Customers to sue the suppliers of tough meat more easily",C:"The police to get written evidence to prosecute poachers",D:"Game to be traced both forward and back within the food chain",correct:"D"},
  {id:174,code:"H88",cat:"Hygiene",q:"Labelling of large game is required if it is being supplied to a game dealer - at what stage should this be undertaken?",A:"Immediately the deer is removed from where it was shot",B:"On arrival at the game larder",C:"When it is delivered to the game dealer’s door",D:"After inspection by a trained person",correct:"D"},
  {id:175,code:"H89",cat:"Hygiene",q:"If you sell a carcass to a game dealer with a declaration you have signed, but have not actually inspected the carcass or internal organs you have?",A:"Committed an offence under the Food Hygiene Regulations",B:"To tell the game dealer",C:"Sell carcass to be processed into burgers in the local hotel only",D:"To ensure you keep the best cuts of venison",correct:"A"},
  {id:176,code:"H90",cat:"Hygiene",q:"Traceability requires labelling of large game carcasses. At what stage should this be undertaken?",A:"As soon as the animal is found",B:"Before removal from the larder",C:"After inspection by a trained person",D:"On delivery to the game dealer",correct:"C"},
  {id:177,code:"H91",cat:"Hygiene",q:"All operators of food businesses must keep sufficiently detailed and accurate records to allow:",A:"Food to be traced from supplier to those supplied at each stage",B:"The weight loss in processing to be calculated",C:"County of origin to be put on the label",D:"Any fraud to be detected",correct:"A"},
  {id:178,code:"H92",cat:"Hygiene",q:"The declaration completed by a trained person for a large game carcass after inspection and before sale must show:",A:"Name and address of trained person to whom payment should be made",B:"Weight, age and species of animal only",C:"Name of trained person, number, time, date, place of killing and declare it shows no abnormalities",D:"Name of trained person, temperature and weight before gralloching.",correct:"C"},
  {id:179,code:"H93",cat:"Hygiene",q:"As the only trained person on a shoot, you should:",A:"Ask the other hunters if the game was behaving normally before being shot and inspect all carcasses yourself",B:"Only inspect those carcasses where a problem is reported",C:"Require all game to be kept un-gralloched until the end of the day so you can do everything yourself at the same time",D:"Issue all hunters and assistants with your labels and tell them to inspect the carcasses and plucks themselves",correct:"A"},
  {id:180,code:"H94",cat:"Hygiene",q:"You are the only trained hunter on the estate but you have 2 assistants helping you with a deer cull. They may:",A:"Gralloch and inspect everything as long as they report to you any abnormalities found",B:"Gralloch the deer themselves but must retain the offal for your inspection",C:"Gralloch and dispose of the green offal if you have previously shown them how to inspect it",D:"Do nothing to the carcass without you being present",correct:"B"},
  {id:181,code:"H95",cat:"Hygiene",q:"A deer runs onto a frozen pond, falls through the ice and drowns. A trained hunter may:",A:"Retrieve it, inspect it and sell it to a dealer in the normal way after draining it of water",B:"Retrieve it, inspect it and give it away to the beaters but not sell it",C:"Retrieve it, inspect it, fire a shot into it and then sell to the dealer",D:"None of these – the carcass must not enter the food chain because it was not killed by a legal hunting method",correct:"D"},
  {id:182,code:"H96",cat:"Hygiene",q:"Your assistant is a good shot but not a trained hunter. You place him in a high seat and should tell him to:",A:"Note the animal's behaviour before shooting, gralloch but wait for you to inspect it.",B:"Gralloch the deer completely, leave the offal in the wood and drag out the carcass.",C:"Gralloch the green offal only and bury it",D:"Leave the un-gralloched carcass at the foot of the high seat and walk home.",correct:"A"},
  {id:183,code:"H97",cat:"Hygiene",q:"You find a game animal freshly dead by the side of a road. What can you do with the carcass?",A:"Inform the local authority so they can dispose of the carcass",B:"Take it home and eat it yourself",C:"Give it away only",D:"Sell it to a game dealer only",correct:"A"},
  {id:184,code:"H98",cat:"Hygiene",q:"You find a dead game animal with minimal damage lying by the roadside, what should you do?",A:"Sell it to a Food Business Operator",B:"Take it home to eat yourself",C:"Ensure that it cannot enter the food chain",D:"Take it home to feed your dog",correct:"C"},
  {id:185,code:"H99",cat:"Hygiene",q:"The correct disposal route for large amounts of game larder offal and waste products is to:",A:"Dispose of in a recognised legal manner",B:"Sell it as pig food to a farmer",C:"Put it in a dustbin for Council rubbish collection",D:"Take it back out to the woods for scavengers.",correct:"A"},
  {id:186,code:"H100",cat:"Hygiene",q:"For good food hygiene practice, when should waste be removed from the workplace?",A:"When the game has been collected by the dealer",B:"When the Environmental Health Officer is due to visit",C:"When it starts to get smelly",D:"When preparation of game for storage is complete",correct:"D"},
  {id:187,code:"H101",cat:"Hygiene",q:"If you suspect game has been exposed to veterinary medication what is your legal responsibility?",A:"Label it dog food only",B:"Ensure the withdrawal period has been observed",C:"Bury in the woods and tell nobody",D:"You must inform all your friends that the meat may have side effects when eaten",correct:"B"},
  {id:188,code:"H102",cat:"Hygiene",q:"You manage a deer park and your best stag has to be darted with a no withdrawal period drug, under veterinary supervision. Two months (eight weeks) later he is shot. The carcass:",A:"Can go into the food chain immediately it has been inspected",B:"Can never go into the food chain",C:"Could have gone into the food chain 6 months (26 weeks) after treatment",D:"Could have gone into the food chain 1 month (4 weeks) after treatment",correct:"B"},
  {id:189,code:"H103",cat:"Hygiene",q:"If game has been recently treated with drugs, what is your legal responsibility?",A:"Ensure you observe any withdrawal period before it enters the food chain",B:"Shoot it and label it as dog food only",C:"Shoot it and bury in the woods and tell nobody",D:"Shoot it and attach a label stating that the meat may have side effects when eaten",correct:"A"},
  {id:190,code:"H104",cat:"Hygiene",q:"If game has been recently treated with drugs, where would you find relevant information?",A:"On the packaging label",B:"The neighbouring keeper",C:"Social media sites",D:"Other syndicate members",correct:"A"},
  {id:191,code:"H105",cat:"Hygiene",q:"If park deer have been recently treated with drugs prior to culling what is your legal responsibility as far a record keeping is concerned?",A:"Attach a label to the deer carcasses stating it has been recently treated with drugs and keep a copy of the label",B:"No records are required",C:"Maintain a record of the drugs administered and note the withdrawal period expiry date",D:"Tell the vet to record and report it",correct:"C"},
  {id:192,code:"H106",cat:"Hygiene",q:"Why is it important to keep records of any veterinary treatments you have administered?",A:"So that you can avoid treating more than you need to",B:"To be able to report the treatment to the FSA",C:"So you can let the Vet know how well the treatment worked",D:"So you can monitor withdrawal periods and ensure game meat is safe to eat",correct:"D"},
  {id:193,code:"H107",cat:"Hygiene",q:"If you suspect a notifiable disease you must?",A:"Label carcass as dog food only",B:"Report it to the Animal and Plant Health Agency at the earliest opportunity",C:"Bury carcass in the woods and tell nobody",D:"Warn all your friends the meat may have long term health effects if eaten",correct:"B"},
  {id:194,code:"H108",cat:"Hygiene",q:"If you have a carcass with a minor abnormality, what should you do?",A:"Feed it to the dogs",B:"Keep it for home use",C:"Make sausages out of the normal looking parts",D:"Note it on your declaration",correct:"D"},
  {id:195,code:"H109",cat:"Hygiene",q:"A carcass with a suspected notifiable disease must be:",A:"Hung up with others until disease is confirmed",B:"Quarantined for further inspection",C:"Left in the woods where it was culled",D:"Used for animal food only",correct:"B"},
  {id:196,code:"H110",cat:"Hygiene",q:"The reason the law requires even suspicion of certain diseases to be reported to the Animal & Plant Health Agency is that:",A:"These diseases pose a risk to both human and animal health.",B:"Media action may be required to prevent a food scare",C:"The animal is suffering and it is cruel not to report it",D:"Researchers can only obtain their samples this way",correct:"A"},
  {id:197,code:"H111",cat:"Hygiene",q:"Who would you inform if you suspected a notifiable disease?",A:"Police & Chief environmental health officer",B:"District Council",C:"Animal and Plant Health Agency",D:"Local Vet",correct:"C"},
  {id:198,code:"H112",cat:"Hygiene",q:"If you report a suspicion of bovine TB to your local Animal and Plant Health Agency, the correct response from them is to:",A:"Tell you to preserve samples associated organs and hold the carcass for their inspection",B:"Order you to incinerate the carcass immediately",C:"Tell you to bury the carcass immediately",D:"Send you written permission to sell the carcass",correct:"A"},
  {id:199,code:"H113",cat:"Hygiene",q:"On inspection, you find symptoms which lead you to suspect TB. You should report the fact to Animal and Plant Health Agency and:",A:"Incinerate or bury the infected glands and pluck and then sell the carcass",B:"Keep the infected glands and associated organs in a plastic bag in a cool place and isolate the carcass for examination",C:"Sell the carcass and freeze the glands in a double plastic bag",D:"Incinerate or bury the whole carcass",correct:"B"},
  {id:200,code:"H114",cat:"Hygiene",q:"If you suspect a notifiable disease and inform the Animal and Plant Health Agency, what records must you keep?",A:"Weather, name of hunter and carcass sex and weight",B:"Date and place of cull",C:"The game dealer keeps records, you need keep none",D:"A receipt from the game dealer",correct:"B"},
  {id:201,code:"H115",cat:"Hygiene",q:"If you suspect notifiable disease in game, you must?",A:"Collect and retain a receipt from the game dealer",B:"Record carcass details in your larder register",C:"Ask the game dealer to keep records, you need keep none",D:"Keep samples and carcass separate from other game and report to the Animal and Plant Health Agency",correct:"D"},
  {id:202,code:"H116",cat:"Hygiene",q:"Who has a responsibility to keep records in respect of carcasses supplied for human consumption?",A:"The game dealer only.",B:"The head keeper only.",C:"The Restaurant manager only",D:"Everyone who supplies game at whatever level",correct:"D"},
  {id:203,code:"H117",cat:"Hygiene",q:"The principle that all game must be traceable requires that large game should be individually labelled and that trays of small game should be labelled, when should this take place?",A:"When the carcasses are placed on the game-cart or transport after being shot.",B:"Immediately after being inspected by a trained person and before being placed in the larder.",C:"When being put on the transport for delivery to the game-dealer",D:"On delivery to the game-dealer",correct:"B"},
  {id:204,code:"H118",cat:"Hygiene",q:"You have a large modern cold room/ chiller with separate hanging areas for large and small game so that cross contamination cannot take place. When you have both large and small game in the chiller, what is the maximum temperature at which it may be kept?",A:"10C",B:"7C",C:"4C",D:"2C",correct:"C"},
  {id:205,code:"H119",cat:"Hygiene",q:"Carcasses of any game which have been handled in an unhygienic way must be;",A:"Carefully put with others to go to the dealer so that he does not notice the problem.",B:"Washed carefully to remove any contamination",C:"Always rejected so that they do not enter the human food chain.",D:"Used for making sausages",correct:"C"},
];

const MEAT_DECKS = [
  { cat: "Hygiene", short: "Hygiene", color: "#CCFF66" },
  { cat: "Deer", short: "Deer", color: "#FFCC33" },
  { cat: "Wild boar", short: "Wild boar", color: "#FF9900" },
];

// A question is answerable only once its correct option is a real letter.
const hasAnswer = (qq) => !!qq && qq.correct !== "?" && !!qq.correct;

const speciesCatsFor = (decks) =>
  new Set(decks.filter((d) => d.cat.startsWith("Species:")).map((d) => d.cat));

// Each track is a self-contained exam: its own questions, decks, and mock-exam
// parameters. `speciesCats` drives the optional "All species (mixed)" deck.
const TRACKS = {
  written: {
    id: "written",
    label: "Written Assessment",
    title: "Written Assessment",
    questions: QUESTIONS,
    decks: WRITTEN_DECKS,
    speciesCats: speciesCatsFor(WRITTEN_DECKS),
    // DSC1 written module: 50 questions, pass mark 40/50 (80%).
    examSize: 50,
    examPass: 40,
  },
  meat: {
    id: "meat",
    label: "Meat Hygiene",
    title: "Large Game Meat Hygiene",
    questions: MEAT_QUESTIONS,
    decks: MEAT_DECKS,
    speciesCats: speciesCatsFor(MEAT_DECKS),
    // Answered questions (Hygiene) play normally; unanswered ones (Deer / Wild
    // boar) are labelled and their answers disabled — handled per question.
    // Mock exam only draws from answered questions. M&H exam: 40 Qs, pass 32/40.
    examSize: 40,
    examPass: 32,
  },
};

const TRACK_LIST = [TRACKS.written, TRACKS.meat];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LETTERS = ["A", "B", "C", "D"];

export default function App() {
  const [track, setTrack] = useState("written"); // "written" | "meat" — which exam
  // deck can be a cat string, "ALL", "ALL_SPECIES", or null (home)
  const [deck, setDeck] = useState(null);
  const [mode, setMode] = useState("mcq"); // "mcq" | "flash" | "exam" — persists across decks
  const [order, setOrder] = useState([]);
  const [pos, setPos] = useState(0);
  const [wrong, setWrong] = useState([]); // wrong letters tried on current question
  const [solved, setSolved] = useState(false); // current question answered correctly
  const [flipped, setFlipped] = useState(false); // flashcard revealed
  const [hits, setHits] = useState(0); // correct attempts (score numerator)
  const [tries, setTries] = useState(0); // total attempts (score denominator)
  // exam mode
  const [examAnswers, setExamAnswers] = useState({}); // id -> chosen letter (editable until submit)
  const [finished, setFinished] = useState(false); // exam results shown

  // Everything below is scoped to the active track.
  const activeTrack = TRACKS[track];
  const activeQuestions = activeTrack.questions;
  const activeDecks = activeTrack.decks;
  const speciesCats = activeTrack.speciesCats;
  const EXAM_SIZE = activeTrack.examSize;
  const EXAM_PASS = activeTrack.examPass;
  // Per-question answer availability. Unanswered questions (correct "?") are
  // shown but their answers are disabled and labelled; answered ones play fully.
  const answeredCounts = useMemo(() => {
    const c = {};
    for (const qq of activeQuestions) if (hasAnswer(qq)) c[qq.cat] = (c[qq.cat] || 0) + 1;
    return c;
  }, [activeQuestions]);
  const unansweredTotal = useMemo(
    () => activeQuestions.filter((qq) => !hasAnswer(qq)).length,
    [activeQuestions]
  );

  const byId = useMemo(
    () => Object.fromEntries(activeQuestions.map((q) => [q.id, q])),
    [activeQuestions]
  );
  const colorFor = useMemo(
    () => Object.fromEntries(activeDecks.map((d) => [d.cat, d.color])),
    [activeDecks]
  );

  const deckLabel = useMemo(() => {
    if (deck === "ALL") return "All questions";
    if (deck === "ALL_SPECIES") return "All species";
    const d = activeDecks.find((x) => x.cat === deck);
    return d ? d.short : "";
  }, [deck, activeDecks]);

  const deckColor = useMemo(() => {
    if (deck === "ALL") return "#f2f5fa";
    if (deck === "ALL_SPECIES") return "#9A8CE8";
    return colorFor[deck] || "#f2f5fa";
  }, [deck, colorFor]);

  const startDeck = useCallback(
    (d) => {
      let qs;
      if (d === "ALL") qs = activeQuestions;
      else if (d === "ALL_SPECIES") qs = activeQuestions.filter((q) => speciesCats.has(q.cat));
      else qs = activeQuestions.filter((q) => q.cat === d);
      // Mock exam only draws from answered questions (unanswered can't be scored).
      if (mode === "exam") qs = qs.filter(hasAnswer);
      let shuffled = shuffle(qs.map((q) => q.id));
      if (mode === "exam") shuffled = shuffled.slice(0, EXAM_SIZE);
      setDeck(d);
      setOrder(shuffled);
      setPos(0);
      setWrong([]);
      setSolved(false);
      setFlipped(false);
      setHits(0);
      setTries(0);
      setExamAnswers({});
      setFinished(false);
    },
    [mode, activeQuestions, speciesCats, EXAM_SIZE]
  );

  const q = byId[order[pos]];
  // Unanswered question: shown but answering is disabled (no key yet).
  const qLocked = !!q && !hasAnswer(q);

  // Stable per-question option order — shuffled once per deck session so it
  // doesn't reshuffle when you navigate back and forth in the exam.
  const optOrders = useMemo(() => {
    const m = {};
    for (const id of order) m[id] = shuffle(LETTERS);
    return m;
  }, [order]);
  const optOrder = q ? optOrders[q.id] || LETTERS : [];

  const next = useCallback(() => {
    setWrong([]);
    setSolved(false);
    setFlipped(false);
    setPos((p) => (p + 1) % order.length);
  }, [order.length]);

  const choose = useCallback(
    (letter, e) => {
      if (e && e.currentTarget) e.currentTarget.blur();
      if (qLocked) return; // unanswered question — answering disabled
      if (solved) return; // once solved, options are locked
      if (wrong.includes(letter)) return; // already-tried wrong option
      setTries((t) => t + 1);
      if (letter === q.correct) {
        setHits((h) => h + 1);
        setSolved(true);
      } else {
        setWrong((w) => [...w, letter]);
      }
    },
    [solved, wrong, q]
  );

  // Flashcard: self-grade counts as one attempt and advances.
  const grade = useCallback(
    (gotIt) => {
      setTries((t) => t + 1);
      if (gotIt) setHits((h) => h + 1);
      setFlipped(false);
      setPos((p) => (p + 1) % order.length);
    },
    [order.length]
  );

  // Exam: answers are editable and revisitable until submit. No feedback yet.
  const examChoose = useCallback(
    (letter, e) => {
      if (e && e.currentTarget) e.currentTarget.blur();
      if (q) setExamAnswers((a) => ({ ...a, [q.id]: letter }));
    },
    [q]
  );

  const examPrev = useCallback(() => setPos((p) => Math.max(0, p - 1)), []);
  const examGoNext = useCallback(
    () => setPos((p) => Math.min(order.length - 1, p + 1)),
    [order.length]
  );
  const examSubmit = useCallback(() => {
    const unanswered = order.filter((id) => !examAnswers[id]).length;
    if (
      unanswered > 0 &&
      !window.confirm(
        `${unanswered} question${unanswered === 1 ? "" : "s"} not answered. Submit anyway?`
      )
    )
      return;
    setFinished(true);
  }, [order, examAnswers]);

  // Exam results (computed when finished).
  const examResult = useMemo(() => {
    if (mode !== "exam") return null;
    let score = 0;
    const byCat = {};
    for (const id of order) {
      const qq = byId[id];
      if (!qq) continue;
      const picked = examAnswers[id];
      const ok = picked === qq.correct;
      if (ok) score += 1;
      const cat = qq.cat;
      if (!byCat[cat]) byCat[cat] = { correct: 0, total: 0 };
      byCat[cat].total += 1;
      if (ok) byCat[cat].correct += 1;
    }
    // Wrong / unanswered questions, for end-of-exam review.
    const review = [];
    for (const id of order) {
      const qq = byId[id];
      if (!qq) continue;
      const picked = examAnswers[id];
      if (picked !== qq.correct) review.push({ q: qq, picked });
    }
    const total = order.length;
    const passNeeded = Math.min(EXAM_PASS, total); // scale if deck < exam size
    return { score, total, passNeeded, passed: score >= passNeeded, byCat, review };
  }, [mode, order, examAnswers, byId, EXAM_PASS]);

  const correct = hits;

  // Count questions per deck for the home screen.
  const counts = useMemo(() => {
    const c = {};
    for (const qq of activeQuestions) c[qq.cat] = (c[qq.cat] || 0) + 1;
    return c;
  }, [activeQuestions]);

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (!deck) {
    return (
      <div style={styles.root}>
        <div style={styles.wrap}>
          <header style={styles.homeHeader}>
            <div style={styles.eyebrow}>DSC1 · DEER STALKING CERTIFICATE 1</div>
            <h1 style={styles.homeTitle}>{activeTrack.title}</h1>
            <p style={styles.homeSub}>
              {activeQuestions.length} questions across {activeDecks.length} topics. Pick an exam, mode, then a deck.
            </p>
          </header>

          <div style={styles.segment}>
            {TRACK_LIST.map((tr) => (
              <button
                key={tr.id}
                style={{ ...styles.segBtn, ...(track === tr.id ? styles.segActive : {}) }}
                onClick={() => setTrack(tr.id)}
              >
                {tr.label}
              </button>
            ))}
          </div>

          <div style={styles.divider}>TEST MODE</div>

          <div style={styles.segment}>
            <button
              style={{ ...styles.segBtn, ...(mode === "mcq" ? styles.segActive : {}) }}
              onClick={() => setMode("mcq")}
            >
              Practice
            </button>
            <button
              style={{ ...styles.segBtn, ...(mode === "flash" ? styles.segActive : {}) }}
              onClick={() => setMode("flash")}
            >
              Flashcards
            </button>
            <button
              style={{ ...styles.segBtn, ...(mode === "exam" ? styles.segActive : {}) }}
              onClick={() => setMode("exam")}
            >
              Mock exam
            </button>
          </div>

          {mode === "exam" ? (
            <p style={styles.examNote}>
              {EXAM_SIZE} questions across all topics. No feedback until the end. Pass mark 80% ({EXAM_PASS}/{EXAM_SIZE}).
            </p>
          ) : unansweredTotal > 0 ? (
            <p style={styles.pendingNote}>
              ⚠ {unansweredTotal} question{unansweredTotal === 1 ? "" : "s"} have no answer key yet. They are shown and labelled, but can't be answered — mock exam skips them.
            </p>
          ) : null}

          <div style={{ ...styles.divider, marginTop: 22 }}>QUESTION BANKS</div>

          <button style={{ ...styles.deckRow, ...styles.deckAll }} onClick={() => startDeck("ALL")}>
            <span style={styles.deckName}>
              Everything
              {unansweredTotal > 0 && <span style={styles.pendingBadge}>{unansweredTotal} unanswered</span>}
            </span>
            <span style={styles.deckCount}>{activeQuestions.length}</span>
          </button>
          {speciesCats.size > 0 && (
            <button style={{ ...styles.deckRow, ...styles.deckAllSpecies }} onClick={() => startDeck("ALL_SPECIES")}>
              <span style={styles.deckName}>All species (mixed)</span>
              <span style={styles.deckCount}>
                {activeDecks.filter((d) => speciesCats.has(d.cat)).reduce((s, d) => s + (counts[d.cat] || 0), 0)}
              </span>
            </button>
          )}

          <div style={styles.divider}>TOPICS</div>

          {activeDecks.map((d) => (
            <button
              key={d.cat}
              style={{ ...styles.deckRow, borderLeft: `4px solid ${d.color}` }}
              onClick={() => startDeck(d.cat)}
            >
              <span style={styles.deckName}>
                <span style={{ ...styles.deckDot, background: d.color }} />
                {d.short}
                {(counts[d.cat] || 0) - (answeredCounts[d.cat] || 0) > 0 && (
                  <span style={styles.pendingBadge}>answers pending</span>
                )}
              </span>
              <span style={styles.deckCount}>{counts[d.cat] || 0}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── EXAM RESULTS ───────────────────────────────────────────────────────────
  if (mode === "exam" && finished && examResult) {
    const { score, total, passNeeded, passed, byCat, review } = examResult;
    const pct = total ? Math.round((score / total) * 100) : 0;
    return (
      <div style={styles.root}>
        <div style={styles.wrap}>
          <header style={styles.header}>
            <button style={styles.backBtn} onClick={() => setDeck(null)}>
              ‹ Decks
            </button>
            <div style={styles.deckTag}>
              <span style={{ ...styles.deckDot, background: deckColor }} />
              {activeTrack.label} · {deckLabel} · Mock exam
            </div>
            <span style={{ width: 38 }} />
          </header>

          <div
            style={{
              ...styles.card,
              borderTop: `3px solid ${passed ? "#CCFF66" : "#FF6699"}`,
              textAlign: "center",
              paddingTop: 30,
              paddingBottom: 30,
            }}
          >
            <div style={{ ...styles.resultVerdict, color: passed ? "#CCFF66" : "#FF6699" }}>
              {passed ? "PASS" : "FAIL"}
            </div>
            <div style={styles.resultScore}>
              {score}
              <span style={styles.resultScoreTotal}> / {total}</span>
            </div>
            <div style={styles.resultPct}>{pct}%</div>
            <div style={styles.resultThreshold}>
              Pass mark {passNeeded} / {total}
              {total < EXAM_SIZE ? " (short deck)" : ""}
            </div>
          </div>

          <div style={styles.breakdownWrap}>
            <div style={styles.breakdownTitle}>BY TOPIC</div>
            {Object.entries(byCat)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([cat, { correct: c, total: t }]) => {
                const short = (activeDecks.find((d) => d.cat === cat) || {}).short || cat;
                const cpct = t ? Math.round((c / t) * 100) : 0;
                return (
                  <div key={cat} style={styles.breakdownRow}>
                    <span style={styles.breakdownName}>
                      <span style={{ ...styles.deckDot, background: colorFor[cat] || "#fff" }} />
                      {short}
                    </span>
                    <span style={styles.breakdownScore}>
                      <span style={styles.breakdownFrac}>{c}/{t}</span>
                      <span style={{ ...styles.breakdownPct, color: cpct >= 80 ? "#CCFF66" : cpct >= 50 ? "#FFCC33" : "#FF6699" }}>
                        {cpct}%
                      </span>
                    </span>
                  </div>
                );
              })}
          </div>

          {review.length > 0 && (
            <div style={styles.breakdownWrap}>
              <div style={styles.breakdownTitle}>REVIEW — {review.length} INCORRECT</div>
              {review.map(({ q: rq, picked }) => (
                <div key={rq.id} style={styles.reviewItem}>
                  <div style={styles.reviewQ}>
                    {rq.q}
                    {rq.conf === "Medium" && <span style={styles.unverifiedBadge}>unverified</span>}
                  </div>
                  <div style={{ ...styles.reviewLine, ...styles.reviewWrong }}>
                    <span style={styles.reviewLbl}>Your answer</span>
                    <span>{picked ? `${picked}. ${rq[picked]}` : "Not answered"}</span>
                  </div>
                  <div style={{ ...styles.reviewLine, ...styles.reviewRight }}>
                    <span style={styles.reviewLbl}>Correct</span>
                    <span>{rq.correct}. {rq[rq.correct]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button style={styles.nextBtn} onClick={() => startDeck(deck)}>
            Retake mock exam →
          </button>
          <button style={{ ...styles.backBtn, width: "100%", padding: "13px 0", fontSize: 14 }} onClick={() => setDeck(null)}>
            Back to decks
          </button>
        </div>
      </div>
    );
  }

  // ── LOCKED QUESTION (no answer key yet) ────────────────────────────────────
  // The current question is unanswered: show it read-only, labelled, answers
  // disabled. Answered questions in the same deck fall through to the quiz below.
  if (qLocked) {
    return (
      <div style={styles.root}>
        <div style={styles.wrap}>
          <header style={styles.header}>
            <button style={styles.backBtn} onClick={() => setDeck(null)}>
              ‹ Decks
            </button>
            <div style={styles.deckTag}>
              <span style={{ ...styles.deckDot, background: deckColor }} />
              {activeTrack.label} · {deckLabel}
            </div>
            <button style={styles.ghostBtn} onClick={() => startDeck(deck)}>
              ↻
            </button>
          </header>

          {q ? (
            <>
              <div style={{ ...styles.card, borderTop: `3px solid ${deckColor}` }}>
                <div style={styles.cardLabel}>
                  <span style={{ color: colorFor[q.cat] || "#fff" }}>
                    {(activeDecks.find((d) => d.cat === q.cat) || {}).short || q.cat}
                    {q.code ? ` · ${q.code}` : ""}
                  </span>
                  <span style={styles.qNum}>
                    {pos + 1} / {order.length}
                  </span>
                </div>
                <p style={styles.question}>{q.q}</p>
                <div style={styles.options}>
                  {LETTERS.map((letter) => (
                    <div key={letter} style={styles.refOption}>
                      <span style={styles.refLetter}>{letter}</span>
                      <span>{q[letter]}</span>
                    </div>
                  ))}
                </div>
                <div style={styles.noteBox}>
                  ⚠ Unanswered — there is no answer key for this question yet, so
                  answering is disabled. It is excluded from the mock exam.
                </div>
              </div>
              <button style={styles.nextBtn} onClick={next}>
                Next question →
              </button>
            </>
          ) : (
            <div style={styles.empty}>No questions.</div>
          )}

          <footer style={styles.footer}>
            <div style={styles.progressRow}>
              <span>
                Question {pos + 1} of {order.length}
              </span>
              <span style={{ opacity: 0.6 }}>unanswered</span>
            </div>
            <div style={styles.track}>
              <div
                style={{
                  ...styles.fill,
                  width: order.length ? `${((pos + 1) / order.length) * 100}%` : "0%",
                }}
              />
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <div style={styles.wrap}>
        <header style={styles.header}>
          <button style={styles.backBtn} onClick={() => setDeck(null)}>
            ‹ Decks
          </button>
          <div style={styles.deckTag}>
            <span style={{ ...styles.deckDot, background: deckColor }} />
            {deckLabel}
          </div>
          {mode === "exam" ? (
            // No restart during an exam — matches the real exam.
            <span style={{ width: 38 }} />
          ) : (
            <button style={styles.ghostBtn} onClick={() => startDeck(deck)}>
              ↻
            </button>
          )}
        </header>

        {q ? (
          <>
            <div style={{ ...styles.card, borderTop: `3px solid ${deckColor}` }}>
              <div style={styles.cardLabel}>
                <span style={{ color: colorFor[q.cat] || "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {(activeDecks.find((d) => d.cat === q.cat) || {}).short || q.cat}
                  {q.conf === "Medium" && <span style={styles.unverifiedBadge}>unverified</span>}
                </span>
                <span style={styles.qNum}>
                  {pos + 1} / {order.length}
                </span>
              </div>
              <p style={styles.question}>{q.q}</p>

              {mode === "mcq" ? (
                <>
                  <div style={styles.options}>
                    {optOrder.map((letter) => {
                      const isAnswer = letter === q.correct;
                      const isWrong = wrong.includes(letter);
                      let s = { ...styles.option };
                      if (solved) {
                        // locked: highlight the correct answer, dim the rest
                        if (isAnswer) s = { ...s, ...styles.optCorrect };
                        else if (isWrong) s = { ...s, ...styles.optWrong };
                        else s = { ...s, ...styles.optDim };
                      } else if (isWrong) {
                        // marked wrong but question still open
                        s = { ...s, ...styles.optWrong };
                      }
                      const locked = solved || isWrong;
                      return (
                        <button
                          key={letter}
                          style={s}
                          onClick={(e) => choose(letter, e)}
                          disabled={locked}
                        >
                          <span>{q[letter]}</span>
                          {solved && isAnswer && <span style={styles.mark}>✓</span>}
                          {isWrong && <span style={styles.mark}>✕</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : mode === "exam" ? (
                <>
                  <div style={styles.options}>
                    {optOrder.map((letter) => {
                      // Editable selection, no feedback — change it any time before submit.
                      const picked = examAnswers[q.id];
                      let s = { ...styles.option };
                      if (picked === letter) s = { ...s, ...styles.optSelected };
                      return (
                        <button
                          key={letter}
                          style={s}
                          onClick={(e) => examChoose(letter, e)}
                        >
                          <span>{q[letter]}</span>
                          {picked === letter && <span style={styles.mark}>●</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div
                  style={styles.flashReveal}
                  onClick={() => !flipped && setFlipped(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === " " || e.key === "Enter") && !flipped) {
                      e.preventDefault();
                      setFlipped(true);
                    }
                  }}
                >
                  {flipped ? (
                    <div style={styles.answerBox}>
                      <div style={styles.answerLabel}>ANSWER</div>
                      <div style={styles.answerText}>{q[q.correct]}</div>
                    </div>
                  ) : (
                    <div style={styles.tapHint}>tap to reveal answer</div>
                  )}
                </div>
              )}
            </div>

            {mode === "mcq" ? (
              <button
                style={{ ...styles.nextBtn, opacity: solved ? 1 : 0.4, cursor: solved ? "pointer" : "not-allowed" }}
                onClick={next}
                disabled={!solved}
              >
                Next question →
              </button>
            ) : mode === "exam" ? (
              <>
                <div style={styles.examNav}>
                  <button
                    style={{ ...styles.navBtn, opacity: pos === 0 ? 0.4 : 1, cursor: pos === 0 ? "not-allowed" : "pointer" }}
                    onClick={examPrev}
                    disabled={pos === 0}
                  >
                    ‹ Previous
                  </button>
                  <button
                    style={{ ...styles.navBtn, opacity: pos + 1 >= order.length ? 0.4 : 1, cursor: pos + 1 >= order.length ? "not-allowed" : "pointer" }}
                    onClick={examGoNext}
                    disabled={pos + 1 >= order.length}
                  >
                    Next ›
                  </button>
                </div>
                <button style={styles.nextBtn} onClick={examSubmit}>
                  Submit exam →
                </button>
              </>
            ) : flipped ? (
              <div style={styles.gradeRow}>
                <button style={{ ...styles.gradeBtn, ...styles.missBtn }} onClick={() => grade(false)}>
                  ✕ Missed
                </button>
                <button style={{ ...styles.gradeBtn, ...styles.gotBtn }} onClick={() => grade(true)}>
                  ✓ Got it
                </button>
              </div>
            ) : (
              <button style={{ ...styles.nextBtn }} onClick={() => setFlipped(true)}>
                Reveal answer
              </button>
            )}
          </>
        ) : (
          <div style={styles.empty}>
            {mode === "exam"
              ? "No answered questions in this deck yet — try Hygiene or Everything."
              : "No questions."}
          </div>
        )}

        <footer style={styles.footer}>
          {mode === "exam" ? (
            <div style={styles.progressRow}>
              <span>Question {pos + 1} of {order.length}</span>
              <span style={{ opacity: 0.6 }}>{Object.keys(examAnswers).length} answered</span>
            </div>
          ) : (
            <div style={styles.progressRow}>
              <span>{tries} {tries === 1 ? "attempt" : "attempts"}</span>
              <span style={styles.scoreChips}>
                <span style={{ color: "#CCFF66" }}>✓ {correct}</span>
                <span style={{ color: "#FF6699" }}>✕ {tries - correct}</span>
                <span style={{ opacity: 0.6 }}>{tries ? Math.round((correct / tries) * 100) : 0}%</span>
              </span>
            </div>
          )}
          <div style={styles.track}>
            <div
              style={{
                ...styles.fill,
                width: order.length
                  ? `${(((mode === "exam"
                      ? Object.keys(examAnswers).length
                      : pos + (mode === "mcq" ? (solved ? 1 : 0) : flipped ? 1 : 0)) ) / order.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "radial-gradient(120% 100% at 50% 0%, #12203a 0%, #0a1424 55%, #060c17 100%)",
    color: "#f2f5fa",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    justifyContent: "center",
    padding: "24px 16px 40px",
    boxSizing: "border-box",
  },
  wrap: { width: "100%", maxWidth: 560 },

  // home
  homeHeader: { marginBottom: 22 },
  homeTitle: { margin: "4px 0 0", fontSize: 34, fontWeight: 800, letterSpacing: "-0.01em" },
  homeSub: { margin: "8px 0 0", color: "#8ea1c0", fontSize: 14.5 },
  segment: {
    display: "flex",
    gap: 4,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#8ea1c0",
    borderRadius: 9,
    padding: "11px 0",
    fontSize: 14.5,
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    transition: "all .15s",
  },
  segActive: { background: "rgba(242,245,250,0.12)", color: "#f2f5fa" },
  examNote: {
    margin: "12px 2px 0",
    fontSize: 13,
    lineHeight: 1.5,
    color: "#8ea1c0",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "11px 13px",
  },
  pendingNote: {
    margin: "12px 2px 0",
    fontSize: 13,
    lineHeight: 1.5,
    color: "#ffe0a3",
    background: "rgba(255,153,0,0.1)",
    border: "1px solid rgba(255,153,0,0.35)",
    borderRadius: 10,
    padding: "11px 13px",
  },
  pendingBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#ffce7a",
    background: "rgba(255,153,0,0.14)",
    border: "1px solid rgba(255,153,0,0.35)",
    borderRadius: 6,
    padding: "2px 7px",
    whiteSpace: "nowrap",
  },
  unverifiedBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#e0b3ff",
    background: "rgba(154,140,232,0.16)",
    border: "1px solid rgba(154,140,232,0.45)",
    borderRadius: 6,
    padding: "2px 7px",
    whiteSpace: "nowrap",
  },
  refOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: 11,
    textAlign: "left",
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#dbe4f2",
    borderRadius: 13,
    padding: "13px 15px",
    fontSize: 14.5,
    lineHeight: 1.35,
    fontWeight: 500,
    boxSizing: "border-box",
  },
  refLetter: {
    color: "#6d80a1",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    flexShrink: 0,
  },
  resultVerdict: { fontSize: 15, fontWeight: 800, letterSpacing: "0.22em", marginBottom: 10 },
  resultScore: { fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" },
  resultScoreTotal: { fontSize: 26, fontWeight: 600, color: "#7f93b4" },
  resultPct: { fontSize: 20, fontWeight: 700, color: "#cdd8ea", marginTop: 8 },
  resultThreshold: { fontSize: 13, color: "#7f93b4", marginTop: 12 },
  breakdownWrap: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "8px 6px",
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.16em",
    color: "#5f75a0",
    padding: "10px 12px 6px",
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 12px",
    fontSize: 14,
  },
  breakdownName: { display: "inline-flex", alignItems: "center", gap: 9, color: "#dbe4f2" },
  breakdownScore: { display: "inline-flex", alignItems: "center", gap: 12 },
  breakdownFrac: { color: "#8ea1c0", fontVariantNumeric: "tabular-nums" },
  breakdownPct: { fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: 42, textAlign: "right" },
  deckRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 10,
    color: "#eaf0f9",
    fontSize: 16,
    cursor: "pointer",
    outline: "none",
    textAlign: "left",
    transition: "background .12s",
  },
  deckAll: { background: "rgba(242,245,250,0.1)", borderColor: "rgba(242,245,250,0.3)", fontWeight: 700 },
  deckAllSpecies: { background: "rgba(154,140,232,0.12)", borderColor: "rgba(154,140,232,0.35)", fontWeight: 600 },
  deckName: { display: "inline-flex", alignItems: "center", gap: 11, fontWeight: 600 },
  deckDot: { width: 10, height: 10, borderRadius: "50%", display: "inline-block", flexShrink: 0 },
  deckCount: { color: "#7f93b4", fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" },
  divider: {
    fontSize: 11,
    letterSpacing: "0.18em",
    color: "#5f75a0",
    fontWeight: 700,
    margin: "20px 4px 12px",
  },

  // quiz header
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 10 },
  backBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#dbe4f2",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
    outline: "none",
    flexShrink: 0,
  },
  deckTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#cdd8ea",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  ghostBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#dbe4f2",
    borderRadius: 999,
    width: 38,
    height: 38,
    fontSize: 15,
    cursor: "pointer",
    outline: "none",
    flexShrink: 0,
  },
  eyebrow: { fontSize: 11, letterSpacing: "0.18em", color: "#7f93b4", fontWeight: 600 },

  card: {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "22px 22px 24px",
    marginBottom: 14,
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 50px -20px rgba(0,0,0,0.6)",
  },
  cardLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  qNum: { color: "#6d80a1", letterSpacing: "0.08em", fontVariantNumeric: "tabular-nums" },
  question: { fontSize: 18.5, lineHeight: 1.45, fontWeight: 600, margin: "0 0 20px" },

  // flashcard mode
  flashReveal: {
    minHeight: 96,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    outline: "none",
  },
  tapHint: {
    color: "#6076a0",
    fontSize: 13.5,
    letterSpacing: "0.04em",
    border: "1px dashed rgba(255,255,255,0.16)",
    borderRadius: 13,
    padding: "26px 20px",
    width: "100%",
    textAlign: "center",
  },
  answerBox: {
    width: "100%",
    background: "rgba(204,255,102,0.1)",
    border: "1px solid rgba(204,255,102,0.4)",
    borderRadius: 13,
    padding: "18px 18px",
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.14em",
    color: "#CCFF66",
    marginBottom: 8,
  },
  answerText: { fontSize: 17, lineHeight: 1.5, fontWeight: 600, color: "#eaffcf" },
  gradeRow: { display: "flex", gap: 10, marginBottom: 26 },
  gradeBtn: {
    flex: 1,
    border: "none",
    borderRadius: 14,
    padding: "15px 0",
    fontSize: 15.5,
    fontWeight: 700,
    cursor: "pointer",
    outline: "none",
    transition: "transform .08s",
  },
  gotBtn: { background: "#CCFF66", color: "#12300a" },
  missBtn: {
    background: "rgba(255,102,153,0.15)",
    color: "#FF6699",
    border: "1px solid rgba(255,102,153,0.4)",
  },

  options: { display: "flex", flexDirection: "column", gap: 10 },
  option: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    textAlign: "left",
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#eaf0f9",
    borderRadius: 13,
    padding: "13px 15px",
    paddingRight: 42,
    fontSize: 14.5,
    lineHeight: 1.35,
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    transition: "all .12s",
  },
  optCorrect: { background: "rgba(204,255,102,0.14)", borderColor: "#CCFF66", color: "#eaffcf" },
  optWrong: { background: "rgba(255,102,153,0.14)", borderColor: "#FF6699", color: "#ffdce8" },
  optSelected: { background: "rgba(255,255,255,0.13)", borderColor: "rgba(255,255,255,0.5)", color: "#fff" },
  optDim: { opacity: 0.42 },
  mark: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: "translateY(-50%)",
    fontWeight: 800,
    fontSize: 15,
    lineHeight: 1,
    pointerEvents: "none",
  },
  noteBox: {
    marginTop: 18,
    padding: "13px 15px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    fontSize: 13.5,
    lineHeight: 1.5,
    color: "#d5dfef",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  nextBtn: {
    width: "100%",
    background: "#f2f5fa",
    color: "#0a1424",
    border: "none",
    borderRadius: 14,
    padding: "15px 0",
    fontSize: 15.5,
    fontWeight: 700,
    marginBottom: 26,
    outline: "none",
    transition: "opacity .15s",
  },
  examNav: { display: "flex", gap: 10, marginBottom: 10 },
  navBtn: {
    flex: 1,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#eaf0f9",
    borderRadius: 14,
    padding: "13px 0",
    fontSize: 14.5,
    fontWeight: 600,
    outline: "none",
    transition: "opacity .15s",
  },
  reviewItem: {
    padding: "12px 12px 6px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  reviewQ: {
    fontSize: 14,
    fontWeight: 600,
    color: "#eaf0f9",
    lineHeight: 1.4,
    marginBottom: 9,
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    flexWrap: "wrap",
  },
  reviewLine: {
    display: "flex",
    gap: 10,
    fontSize: 13.5,
    lineHeight: 1.4,
    padding: "5px 0",
  },
  reviewWrong: { color: "#ffb3cc" },
  reviewRight: { color: "#d6f5a3" },
  reviewLbl: {
    flexShrink: 0,
    width: 82,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#7f93b4",
    paddingTop: 1,
  },
  empty: { padding: 40, textAlign: "center", color: "#7f93b4" },
  footer: { marginTop: 4 },
  progressRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12.5,
    color: "#8ea1c0",
    marginBottom: 8,
  },
  scoreChips: { display: "flex", gap: 14, fontWeight: 600 },
  track: { height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  fill: { height: "100%", background: "linear-gradient(90deg,#66CCFF,#CCFF66)", transition: "width .3s" },
};
